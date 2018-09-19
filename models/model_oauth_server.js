// Model to create Oauth2 server
var models = require('./models.js');
var oauth2 = require('../config').oauth2;
var _ = require('lodash');
var jsonwebtoken = require('jsonwebtoken');
var debug = require('debug')('idm:oauth2-model_oauth_server')
var config_authzforce = require('./../config.js').authorization.authzforce
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var user = models.user;
var iot = models.iot;
var role_assignment = models.role_assignment;
var oauth_client = models.oauth_client;
var oauth_access_token = models.oauth_access_token;
var oauth_authorization_code = models.oauth_authorization_code;
var oauth_refresh_token = models.oauth_refresh_token;
var user_authorized_application = models.user_authorized_application


function getAccessToken(bearerToken) {
  
  debug("-------getAccesToken-------")
  
  return oauth_access_token
    .findOne({
      where: {access_token: bearerToken},
      attributes: [['access_token', 'accessToken'], ['expires', 'accessTokenExpiresAt'],'scope'],
      include: [
        {
          model: user,
          attributes: ['id', 'username', 'email', 'gravatar'],
        },
        {
          model: iot,
          attributes: ['id'],
        },
        {
          model: oauth_client,
          attributes: ['id', 'grant_type']
        }
      ],
    })
    .then(function (accessToken) {
      if (!accessToken) return false;
      var token = accessToken.toJSON()
      token.oauth_client = accessToken.OauthClient
      if (accessToken.User) {
        token.user = accessToken.User;
      } else if (accessToken.Iot) {
        token.user = accessToken.Iot;
      }

      delete token.OauthClient
      delete token.User 
      delete token.Iot

      //token.scope = token.scope
      return token;
    })
    .catch(function (err) {
      debug("getAccessToken - Err: "+ err)
    });
}

function getClient(clientId, clientSecret) {
  
  debug("-------getClient-------")
  
  const options = {
    where: {id: clientId},
    attributes: ['id', 'redirect_uri', 'token_type', 'jwt_secret', 'scope', 'grant_type']
  };
  if (clientSecret) options.where.secret = clientSecret;

  return oauth_client
    .findOne(options)
    .then(function (client) {
      if (!client) return new Error("client not found");
      
      var clientWithGrants = client

      clientWithGrants.grants = clientWithGrants.grant_type
      clientWithGrants.redirectUris = [clientWithGrants.redirect_uri]
      clientWithGrants.refreshTokenLifetime = oauth2.refresh_token_lifetime
      clientWithGrants.accessTokenLifetime  = oauth2.access_token_lifetime
      clientWithGrants.authorizationCodeLifetime  = oauth2.authorization_code_lifetime

      delete clientWithGrants.grant_type
      delete clientWithGrants.redirect_uri
      
      return clientWithGrants
    }).catch(function (err) {
      debug("getClient - Err: ", err)
    });
}


function getIdentity(id, password) {

  debug("-------getIdentity-------")

  var search_user = user.findOne({
    where: {email: id},
    attributes: ['id', 'username', 'gravatar', 'email', 'salt', 'password', 'scope'],
  })

  var search_iot = iot.findOne({
    where: {id: id},
    attributes: ['id', 'password', 'salt'],
  })

  return Promise.all([search_user, search_iot]).then(function(values) {

    var user = values[0]
    var iot = values[1]

    if ((user && iot) || (!user && !iot)) {
      return false
    }

    if (user) {
      if (user.verifyPassword(user.salt, password)) {
          return user
        } 
    }

    if (iot) {
      if (iot.verifyPassword(iot.salt, password)) {
          return iot
        } 
    }

    return false

  }).catch(function(err) {
    debug("getIdentity - Err: ", err)
  })
}


function getUser(email, password) {

  debug("-------getUser-------")
  return user
    .findOne({
      where: {email: email},
      attributes: ['id', 'username', 'password', 'scope'],
    })
    .then(function (user) {
      if (user) {
        if (user.verifyPassword(user.salt, password)) {
          return user.toJSON()
        } 
      }
      return false
    })
    .catch(function (err) {
      debug("getUser - Err: ", err)
    });
}


function revokeAuthorizationCode(code) {

  debug("-------revokeAuthorizationCode-------")

  return oauth_authorization_code.findOne({
    where: {
      authorization_code: code.code
    }
  }).then(function (rCode) {

    var expiredCode = code
    expiredCode.expiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredCode
  }).catch(function (err) {
    debug("getUser - Err: ", err)
  });
}

function revokeToken(token) {

  debug("-------revokeToken-------")

  return oauth_refresh_token.findOne({
    where: {
      refresh_token: token.refreshToken
    }
  }).then(function (rT) {
    if (rT) rT.destroy();

    var expiredToken = token
    expiredToken.refreshTokenExpiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredToken
  }).catch(function (err) {
    debug("revokeToken - Err: ", err)
  });
}

function saveToken(token, client, identity) {

  debug("-------saveToken-------")
  if (client.token_type === 'jwt') {
    return generateJwtToken(token, client, identity)
  } else {
    return storeToken(token, client, identity)
  }
}

function generateJwtToken(token, client, identity) {
  
  debug("-------generateJwtToken-------")
  var user_info = require('../oauth_response/oauth_user_response.json');
  var iot_info = require('../oauth_response/oauth_iot_response.json');

  return create_oauth_response(identity, client.id, null, null, config_authzforce.enabled, null).then(function(response) {
    token.accessToken = jsonwebtoken.sign(response, client.jwt_secret);
    return storeToken(token, client, identity)
  }).catch(function(error) {
    debug("-------generateJwtToken-------", error)
  })
}

function storeToken(token, client, identity) {

  debug("-------saveBearerToken-------")

  var user_id = null 
  var iot_id = null

  if (identity) {
    if (identity._modelOptions.tableName === "user") {
      user_id = identity.id
    }

    if (identity._modelOptions.tableName === "iot") {
      iot_id = identity.id
    }
  }

  return Promise.all([
      oauth_access_token.create({
        access_token: token.accessToken,
        expires: token.accessTokenExpiresAt,
        oauth_client_id: client.id,
        user_id: user_id,
        iot_id: iot_id,
        scope: token.scope
      }),
      token.refreshToken ? oauth_refresh_token.create({ // no refresh token for client_credentials
        refresh_token: token.refreshToken,
        expires: token.refreshTokenExpiresAt,
        oauth_client_id: client.id,
        user_id: user_id,
        iot_id: iot_id,
        scope: token.scope
      }) : [],
      (user_id) ? user_authorized_application.findOrCreate({ // User has enable application to read their information
        where: { user_id: user_id, oauth_client_id: client.id },
        defaults: {
          user_id: user_id,
          oauth_client_id: client.id
        }
      }) : []
    ])
    .then(function (resultsArray) {

      if (user_id || iot_id) {
        token[identity._modelOptions.tableName] = identity
      }
      return _.assign(  // expected to return client and user, but not returning
        {
          client: client,
          access_token: token.accessToken, // proxy
          refresh_token: token.refreshToken, // proxy
        },
        token
      )
    })
    .catch(function (err) {
      debug("saveToken - Err: ", err)
    });
}

function getAuthorizationCode(code) {

  debug("-------getAuthorizationCode-------")

  return oauth_authorization_code
    .findOne({
      attributes: ['oauth_client_id', 'expires', 'user_id', 'scope'],
      where: {authorization_code: code},
      include: [user, oauth_client]
    })
    .then(function (authCodeModel) {
      if (!authCodeModel) return false;
      var client = authCodeModel.OauthClient
      var user = authCodeModel.User
      return reCode = {
        code: code,
        client: client,
        expiresAt: authCodeModel.expires,
        redirectUri: client.redirect_uri,
        user: user,
        scope: authCodeModel.scope,
      };
    }).catch(function (err) {
      debug("getAuthorizationCode - Err: ", err)
    });
}

function saveAuthorizationCode(code, client, user) {

  debug("-------saveAuthorizationCode-------")

  return oauth_authorization_code
    .create({
      expires: code.expiresAt,
      oauth_client_id: client.id,
      redirect_uri: client.redirect_uri,
      authorization_code: code.authorizationCode,
      user_id: user.id,
      scope: code.scope
    })
    .then(function () {
      code.code = code.authorizationCode
      return code
    }).catch(function (err) {
      debug("saveAuthorizationCode - Err: ", err)
    });
}


function getUserFromClient(client) {

  debug("-------getUserFromClient-------")

  var options = {
    where: {oauth_client_id: client.id},
    include: [user]
  };
  //if (client.client_secret) options.where.secret = client.client_secret;

  return role_assignment
    .findOne(options)
    .then(function (role_assignment) {
      if (!role_assignment) return false;
      if (!role_assignment.User) return false;
      return role_assignment.User.toJSON();
    }).catch(function (err) {
      debug("getUserFromClient - Err: ", err)
    });
}

function getRefreshToken(refreshToken) {

  debug("-------getRefreshToken-------")

  if (!refreshToken || refreshToken === 'undefined') return false

  return oauth_refresh_token
    .findOne({
      attributes: ['oauth_client_id', 'user_id', 'expires'],
      where: {refresh_token: refreshToken},
      include: [oauth_client, user]

    })
    .then(function (savedRT) {

      var tokenTemp = {
        user: savedRT ? savedRT.User : {},
        client: savedRT ? savedRT.OauthClient : {},
        refreshTokenExpiresAt: savedRT ? new Date(savedRT.expires) : null,
        refreshToken: refreshToken,
        refresh_token: refreshToken,
        scope: savedRT ? savedRT.scope : ''
      };
      return tokenTemp;

    }).catch(function (err) {
      debug("getRefreshToken - Err: ", err)
    });
}


function create_oauth_response(identity, application_id, action, resource, authzforce, req_app) {

  debug("-------create_oauth_response-------")

  if (identity._modelOptions.tableName === 'user') {

      var user_info = require('../oauth_response/oauth_user_response.json');

      user_info.username = identity.username
      user_info.app_id = application_id
      user_info.isGravatarEnabled = identity.gravatar
      user_info.email = identity.email
      user_info.id = identity.id

      return search_user_info(user_info, action, resource, authzforce, req_app)
  } else if (identity._modelOptions.tableName === 'iot') {

      var iot_info = require('../oauth_response/oauth_iot_response.json');

      iot_info.app_id = application_id
      iot_info.id = identity.id

      return iot_info
  }
}

// Check if user has enabled the application to read their details
function search_user_info(user_info, action, resource, authzforce, req_app) {

    debug("-------search_user_info-------")

    return new Promise(function(resolve, reject) {

      var promise_array = []

      var search_roles = user_roles(user_info.id, user_info.app_id)

      promise_array.push(search_roles)

      var search_trusted_apps = trusted_applications(user_info.app_id)

      promise_array.push(search_trusted_apps)

      if (action && resource && req_app) {

          var search_permissions = search_roles.then(function(roles) {
              return user_permissions(roles.all, user_info.app_id, action, resource)
          })
          promise_array.push(search_permissions)
      }

      // Search authzforce if level 3 enabled
      if (config_authzforce.enabled && authzforce) {
          var search_authzforce = app_authzforce_domain(user_info.app_id)
          promise_array.push(search_authzforce)
      }

      Promise.all(promise_array).then(function(values) {

          var roles = values[0]

          user_info.roles = roles.user
          user_info.organizations = roles.organizations

          user_info.trusted_applications = values[1]

          if (action && resource && req_app) {
              if (values[2] && values[2].length > 0 && (req_app === user_info.app_id || user_info.trusted_applications.includes(req_app))) {
                  user_info.authorization_decision = "Permit"
              } else {
                  user_info.authorization_decision = "Deny"
              }
          }

          if (config_authzforce.enabled && authzforce) {
              var authzforce_domain = values[2]
              if (authzforce_domain) {
                  user_info.app_azf_domain = authzforce_domain.az_domain
              }
          }

          resolve(user_info)

      }).catch(function(error) {
          reject({message: 'Internal error', code: 500, title: 'Internal error'})
      })
    })
}

// Search user roles in application
function user_roles(user_id, app_id) {

  debug("-------user_roles-------")
  var promise_array = []

  // Search organizations in wich user is member or owner
  promise_array.push(
      models.user_organization.findAll({ 
          where: { user_id: user_id },
          include: [{
              model: models.organization,
              attributes: ['id']
          }]
      })
  )

  // Search roles for user or the organization to which the user belongs
  promise_array.push(
      promise_array[0].then(function(organizations) { 
          var search_role_organizations = []
          if (organizations.length > 0) {

              for (var i = 0; i < organizations.length; i++) {
                  search_role_organizations.push({organization_id: organizations[i].organization_id, role_organization: organizations[i].role})
              }
          }
          return models.role_assignment.findAll({
              where: { [Op.or]: [{ [Op.or]: search_role_organizations}, {user_id: user_id}], 
                       oauth_client_id: app_id,
                       role_id: { [Op.notIn]: ['provider', 'purchaser']} },
              include: [{
                  model: models.user,
                  attributes: ['id', 'username', 'email', 'gravatar']
              },{
                  model: models.role,
                  attributes: ['id', 'name']
              }, {
                  model: models.organization,
                  attributes: ['id', 'name', 'description', 'website']
              }]
          })
      })
  )

  return Promise.all(promise_array).then(function(values) {
      var role_assignment = values[1]

      var user_app_info = { user: [], organizations: [], all: [] }

      for (i=0; i < role_assignment.length; i++) {

          var role = role_assignment[i].Role.dataValues

          user_app_info.all.push(role.id)

          if (role_assignment[i].Organization) {
              
              var organization = role_assignment[i].Organization.dataValues
              var index = user_app_info.organizations.map(function(e) { return e.id; }).indexOf(organization.id);

              if (index < 0) {
                  organization['roles'] = [role]
                  user_app_info.organizations.push(organization)
              } else {
                  user_app_info.organizations[index].roles.push(role)
              }
          }

          if (role_assignment[i].User) {
              user_app_info.user.push(role)
          }
      }
      return Promise.resolve(user_app_info)
  }).catch(function(error) {
      return Promise.reject({message: 'Internal error', code: 500, title: 'Internal error'})
  })
}

// Search user permissions in application whose action and resource are recieved from Pep Proxy
function user_permissions(roles_id, app_id, action, resource) {

    debug("-------user_permissions-------")
    return models.role_permission.findAll({
        where: { role_id: roles_id },
        attributes: ['permission_id']
    }).then(function(permissions) {
        if (permissions.length > 0) {
            return models.permission.findAll({
                where: { id: permissions.map(elem => elem.permission_id),
                         oauth_client_id: app_id,
                         action: action,
                         resource: resource }
            })
        } else {
            return []
        }
    })
}

// Search Trusted applications
function trusted_applications(app_id) {

  debug("-------trusted_applications-------")
    return models.trusted_application.findAll({
        where: { oauth_client_id: app_id },
        attributes: ['trusted_oauth_client_id']
    }).then(function(trusted_apps) {
        if (trusted_apps.length > 0) {
            return trusted_apps.map(id => id.trusted_oauth_client_id)
        } else {
            return []
        }
    })
}

// Search authzforce domain for specific application
function app_authzforce_domain(app_id) {

  debug("-------app_authzforce_domain-------")
    return models.authzforce.findOne({
        where: { oauth_client_id: app_id },
        attributes: ['az_domain']
    })
}

// function validateScope(token, client) {

//   debug("-------validateScope-------")

//   return (user.scope === scope && client.scope === scope && scope !== null) ? scope : false
// }

// function verifyScope(token, scope) {

//   debug("-------verifyScope-------")

//     return token.scope === scope
// }

module.exports = {
  //generateOAuthAccessToken, optional - used for jwt
  //generateAuthorizationCode, optional
  //generateOAuthRefreshToken, - optional
  getAccessToken: getAccessToken,
  getAuthorizationCode: getAuthorizationCode, //getOAuthAuthorizationCode renamed to,
  getClient: getClient,
  getRefreshToken: getRefreshToken,
  getUser: getUser,
  getIdentity: getIdentity,
  getUserFromClient: getUserFromClient,
  revokeAuthorizationCode: revokeAuthorizationCode,
  revokeToken: revokeToken,
  saveToken: saveToken,
  saveAuthorizationCode: saveAuthorizationCode,
  create_oauth_response: create_oauth_response
  // validateScope: validateScope,
  // verifyScope: verifyScope,
}


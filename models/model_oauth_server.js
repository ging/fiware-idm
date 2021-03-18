// Model to create Oauth2 server
const models = require('./models.js');
const oauth2 = require('../config').oauth2;
const _ = require('lodash');
const jsonwebtoken = require('jsonwebtoken');
const debug = require('debug')('idm:oauth2-model_oauth_server');
const config_service = require('../lib/configService.js');
const config = config_service.get_config();
const config_authzforce = config.authorization.authzforce;
const config_oauth2 = config.oauth2;
const config_cors = config.cors;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const user = models.user;
const iot = models.iot;
const role_assignment = models.role_assignment;
const oauth_client = models.oauth_client;
const oauth_access_token = models.oauth_access_token;
const oauth_authorization_code = models.oauth_authorization_code;
const oauth_refresh_token = models.oauth_refresh_token;
const user_authorized_application = models.user_authorized_application;

const identity_attributes = config.identity_attributes || { enabled: false };

function getAccessToken(bearerToken) {
  debug('-------getAccesToken-------');

  return oauth_access_token
    .findOne({
      where: { access_token: bearerToken },
      attributes: [['access_token', 'accessToken'], ['expires', 'accessTokenExpiresAt'], 'scope', 'valid'],
      include: [
        {
          model: user,
          attributes: ['id', 'username', 'email', 'description', 'website', 'gravatar', 'image', 'extra', 'eidas_id']
        },
        {
          model: iot,
          attributes: ['id']
        },
        {
          model: oauth_client,
          attributes: ['id', 'grant_type']
        }
      ]
    })
    .then(function (accessToken) {
      if (!accessToken) {
        return false;
      }
      const token = accessToken.toJSON();
      token.oauth_client = accessToken.OauthClient;

      if (accessToken.User) {
        token.user = accessToken.User;
        token.user.dataValues.type = 'user';
      } else if (accessToken.Iot) {
        token.user = accessToken.Iot;
        token.user.dataValues.type = 'iot';
      }

      delete token.OauthClient;
      delete token.User;
      delete token.Iot;

      //token.scope = token.scope
      return token;
    })
    .catch(function (err) {
      debug('getAccessToken - Err: ' + err);
    });
}

function getClient(clientId, clientSecret) {
  debug('-------getClient-------');
  const options = {
    where: { id: clientId },
    attributes: ['id', 'redirect_uri', 'token_types', 'jwt_secret', 'scope', 'grant_type', 'response_type']
  };
  if (clientSecret) {
    options.where.secret = clientSecret;
  }
  return oauth_client
    .findOne(options)
    .then(function (client) {
      if (!client) {
        return null;
      } //new Error("client not found");
      const clientWithGrants = client;

      clientWithGrants.grants = clientWithGrants.grant_type;
      clientWithGrants.response_types = clientWithGrants.response_type;
      clientWithGrants.redirectUris = clientWithGrants.redirect_uri;
      clientWithGrants.refreshTokenLifetime = oauth2.refresh_token_lifetime;
      clientWithGrants.accessTokenLifetime = oauth2.access_token_lifetime;
      clientWithGrants.authorizationCodeLifetime = oauth2.authorization_code_lifetime;

      delete clientWithGrants.grant_type;
      delete clientWithGrants.redirect_uri;

      return clientWithGrants;
    })
    .catch(function (err) {
      debug('getClient - Err: ', err);
    });
}

function getIdentity(id, password, oauth_client_id) {
  debug('-------getIdentity-------');

  const search_user = user.findOne({
    where: { email: id },
    attributes: ['id', 'username', 'gravatar', 'image', 'email', 'salt', 'password', 'scope', 'eidas_id', 'extra']
  });
  debug(oauth_client_id);
  const search_iot = iot.findOne({
    where: {
      id,
      oauth_client_id
    },
    attributes: ['id', 'password', 'salt']
  });

  return Promise.all([search_user, search_iot])
    .then(function (values) {
      const user = values[0];
      const iot = values[1];

      if ((user && iot) || (!user && !iot)) {
        return false;
      }

      if (user) {
        if (user.verifyPassword(password)) {
          user.dataValues.type = 'user';
          return user;
        }
      }

      if (iot) {
        if (iot.verifyPassword(password)) {
          iot.dataValues.type = 'iot';
          return iot;
        }
      }

      return false;
    })
    .catch(function (err) {
      debug('getIdentity - Err: ', err);
    });
}

function getUser(email, password) {
  debug('-------getUser-------');

  return user
    .findOne({
      where: { email },
      attributes: ['id', 'username', 'password', 'scope']
    })
    .then(function (user) {
      if (user) {
        if (user.verifyPassword(password)) {
          return user.toJSON();
        }
      }
      return false;
    })
    .catch(function (err) {
      debug('getUser - Err: ', err);
    });
}

function revokeAuthorizationCode(code) {
  debug('-------revokeAuthorizationCode-------');

  return oauth_authorization_code
    .findOne({
      where: {
        authorization_code: code.code,
        valid: true
      }
    })
    .then(function (rCode) {
      if (rCode) {
        rCode.valid = false;
        rCode.save();
      }

      code.valid = false;
      return code;
    })
    .catch(function (err) {
      debug('getUser - Err: ', err);
    });
}

function revokeRefreshToken(refreshToken, code, client_id) {
  debug('-------revokeRefreshToken-------');

  const where_clause = {
    valid: true
  };

  if (code) {
    where_clause.authorization_code = code;
  } else if (refreshToken) {
    where_clause.refresh_token = refreshToken;
  }

  if (client_id) {
    where_clause.oauth_client_id = client_id;
  }

  return oauth_refresh_token
    .findOne({
      where: where_clause
    })
    .then(function (rT) {
      if (rT) {
        rT.valid = false;
        rT.save();
        rT.type = 'refresh_token';
        rT.client = rT.oauth_client_id;
      }
      return rT ? rT : null;
    })
    .catch(function (err) {
      debug('revokeRefreshToken - Err: ', err);
    });
}

function revokeAccessToken(accessToken, code, client_id, refresh_token) {
  debug('-------revokeAccessToken-------');
  const where_clause = {
    valid: true
  };

  if (code) {
    where_clause.authorization_code = code;
  } else if (accessToken) {
    where_clause.access_token = accessToken;
  } else if (refresh_token) {
    where_clause.refresh_token = refresh_token;
  }

  if (client_id) {
    where_clause.oauth_client_id = client_id;
  }

  return oauth_access_token
    .findOne({
      where: where_clause
    })
    .then(function (aT) {
      if (aT) {
        aT.valid = false;
        aT.save();
        aT.type = 'access_token';
        aT.client = aT.oauth_client_id;
      }

      return aT ? aT : null;
    })
    .catch(function (err) {
      debug('revokeRefreshToken - Err: ', err);
    });
}

function saveToken(token, client, identity) {
  debug('-------saveToken-------');

  if (token.scope.includes('permanent')) {
    token.accessTokenExpiresAt = null;
    delete token.refreshToken;
    delete token.refreshTokenExpiresAt;
  }

  if (token.scope.includes('jwt')) {
    return generateJwtToken(token, client, identity);
  }

  return storeToken(token, client, identity, false);
}

function generateJwtToken(token, client, identity) {
  debug('-------generateJwtToken-------');

  return create_oauth_response(identity, client.id, null, null, config_authzforce.enabled, null)
    .then(function (response) {
      if (identity) {
        response.type = identity.type || identity.dataValues.type;
      }
      const options = {};

      if (token.accessTokenExpiresAt) {
        options.expiresIn = config_oauth2.access_token_lifetime;
      }

      token.accessToken = jsonwebtoken.sign(response, client.jwt_secret, options);
      return storeToken(token, client, identity, true);
    })
    .catch(function (error) {
      debug('-------generateJwtToken-------', error);
    });
}

function storeToken(token, client, identity, jwt) {
  debug('-------storeToken-------');

  let user_id = null;
  let iot_id = null;

  if (identity) {
    if (identity.dataValues.type === 'user') {
      user_id = identity.id;
    }

    if (identity.dataValues.type === 'iot') {
      iot_id = identity.id;
    }
  }

  let refresh_token_promise = token.refreshToken
    ? oauth_refresh_token.create({
        // no refresh token for client_credentials
        refresh_token: token.refreshToken,
        expires: token.refreshTokenExpiresAt,
        valid: true,
        oauth_client_id: client.id,
        user_id,
        iot_id,
        authorization_code: token.authorizationCode ? token.authorizationCode : null,
        scope: token.scope
      })
    : Promise.resolve();

  let access_token_promise = !jwt
    ? refresh_token_promise.then(function () {
        return oauth_access_token.create({
          access_token: token.accessToken,
          expires: token.accessTokenExpiresAt,
          valid: true,
          oauth_client_id: client.id,
          user_id,
          iot_id,
          refresh_token: token.refreshToken ? token.refreshToken : null,
          authorization_code: token.authorizationCode ? token.authorizationCode : null,
          scope: token.scope === 'all' ? null : token.scope
        });
      })
    : Promise.resolve();

  //AQUI
  let shared_attributes = ['username', 'email'];
  let user_autho_app_promise =
    user_id && config_oauth2.ask_authorization
      ? user_authorized_application.findOrCreate({
          where: { user_id, oauth_client_id: client.id },
          defaults: {
            user_id,
            oauth_client_id: client.id,
            shared_attributes: shared_attributes
          }
        })
      : Promise.resolve();

  return access_token_promise
    .then(function () {
      return user_autho_app_promise.then(function () {
        if (user_id || iot_id) {
          token[identity.dataValues.type] = identity.dataValues.type;
        }

        if (token.scope === 'all') {
          delete token.scope;
        }

        return _.assign(
          // expected to return client and user, but not returning
          {
            client,
            access_token: token.accessToken, // proxy
            refresh_token: token.refreshToken // proxy
          },
          token
        );
      });
    })
    .catch(function (err) {
      debug('saveToken - Err: ', err);
    });
}

function getAuthorizationCode(code) {
  debug('-------getAuthorizationCode-------');

  return oauth_authorization_code
    .findOne({
      attributes: ['oauth_client_id', 'redirect_uri', 'expires', 'user_id', 'scope', 'valid'],
      where: { authorization_code: code },
      include: [user, oauth_client]
    })
    .then(function (authCodeModel) {
      if (!authCodeModel) {
        return false;
      }
      const client = authCodeModel.OauthClient;
      const user = authCodeModel.User;
      user.dataValues.type = 'user';
      const reCode = {
        code,
        client,
        expiresAt: authCodeModel.expires,
        redirectUri: authCodeModel.redirect_uri,
        valid: authCodeModel.valid,
        user,
        scope: authCodeModel.scope
      };

      return reCode;
    })
    .catch(function (err) {
      debug('getAuthorizationCode - Err: ', err);
    });
}

function saveAuthorizationCode(code, client, user) {
  debug('-------saveAuthorizationCode-------');
  debug(code);
  return oauth_authorization_code
    .create({
      expires: code.expiresAt,
      oauth_client_id: client.id,
      redirect_uri: code.redirectUri,
      authorization_code: code.authorizationCode,
      valid: true,
      user_id: user.id,
      scope: code.scope
    })
    .then(function () {
      code.code = code.authorizationCode;
      return code;
    })
    .catch(function (err) {
      debug('saveAuthorizationCode - Err: ', err);
    });
}

function getUserFromClient(client) {
  debug('-------getUserFromClient-------');

  const options = {
    where: { oauth_client_id: client.id },
    include: [user]
  };
  //if (client.client_secret) options.where.secret = client.client_secret;

  return role_assignment
    .findOne(options)
    .then(function (role_assignment) {
      if (!role_assignment) {
        return false;
      }
      if (!role_assignment.User) {
        return false;
      }
      return role_assignment.User.toJSON();
    })
    .catch(function (err) {
      debug('getUserFromClient - Err: ', err);
    });
}

function getRefreshToken(refreshToken) {
  debug('-------getRefreshToken-------');

  if (!refreshToken || refreshToken === 'undefined') {
    return false;
  }

  return oauth_refresh_token
    .findOne({
      attributes: ['oauth_client_id', 'user_id', 'expires', 'valid'],
      where: { refresh_token: refreshToken },
      include: [
        {
          model: user,
          attributes: ['id', 'username', 'email', 'gravatar', 'extra', 'eidas_id']
        },
        {
          model: iot,
          attributes: ['id']
        },
        {
          model: oauth_client,
          attributes: ['id', 'grant_type']
        }
      ]
    })
    .then(function (savedRT) {
      const tokenTemp = {
        user: savedRT ? savedRT.User : {},
        client: savedRT ? savedRT.OauthClient : {},
        expires: savedRT ? new Date(savedRT.expires) : null,
        valid: savedRT.valid,
        token: refreshToken,
        scope: savedRT ? savedRT.scope : ''
      };
      if (savedRT.User) {
        tokenTemp.user.dataValues.type = 'user';
      } else if (savedRT.Iot) {
        tokenTemp.user.dataValues.type = 'iot';
      }

      return tokenTemp;
    })
    .catch(function (err) {
      debug('getRefreshToken - Err: ', err);
    });
}

function create_oauth_response(
  identity,
  application_id,
  action,
  resource,
  authorization_service_header,
  authzforce,
  req_app
) {
  debug('-------create_oauth_response-------');

  let type;
  if (identity) {
    type = identity.type || identity.dataValues.type;
  }

  if (type === 'user') {
    const user_info = JSON.parse(JSON.stringify(require('../templates/oauth_response/oauth_user_response.json')));

    user_info.id = identity.id;
    user_info.app_id = application_id;

    return models.user_authorized_application
      .findOne({
        where: { user_id: identity.id, oauth_client_id: application_id }
      })
      .then(function (third_party_application) {
        if (third_party_application) {
          const shared_attributes = third_party_application.shared_attributes || '';
          if (shared_attributes.includes('username')) {
            user_info.username = identity.username;
          }
          if (shared_attributes.includes('email')) {
            user_info.email = identity.email;
          }
          if (
            shared_attributes.includes('identity_attributes') &&
            identity.extra &&
            identity.extra.identity_attributes &&
            identity_attributes.enabled
          ) {
            user_info.attributes = identity.extra.identity_attributes;
          }

          if (shared_attributes.includes('image') && config.cors && config_cors.enabled) {
            user_info.image = identity.image !== 'default' ? config.host + '/img/users/' + identity.image : '';
          }

          if (shared_attributes.includes('gravatar')) {
            user_info.isGravatarEnabled = identity.gravatar;
          }
          if (identity.eidas_idm && shared_attributes.includes('eidas_profile')) {
            user_info.eidas_profile = identity.extra.eidas_profile;
          }
        }

        return search_user_info(user_info, action, resource, authorization_service_header, authzforce, req_app);

      });
  } else if (type === 'iot') {
    const iot_info = JSON.parse(JSON.stringify(require('../templates/oauth_response/oauth_iot_response.json')));

    iot_info.app_id = application_id;
    iot_info.id = identity.id;

    return search_iot_info(iot_info);
  }
  return search_app_info(application_id);
}

function search_app_info(application_id) {
  debug('-------search_app_info-------');

  return Promise.resolve({
    app_id: application_id
  });
}

function search_iot_info(iot_info) {
  debug('-------search_iot_info-------');

  return Promise.resolve(iot_info);
}

// Check if user has enabled the application to read their details
function search_user_info(user_info, action, resource, authorization_service_header, authzforce, req_app) {
  debug('-------search_user_info-------');
  return new Promise(function (resolve, reject) {
    const promise_array = [];

    // Insert search trusted applications promise
    const search_trusted_apps = trusted_applications(req_app);
    promise_array.push(search_trusted_apps);

    // Insert search search roles promise
    const search_roles = user_roles(user_info.id, user_info.app_id);
    promise_array.push(search_roles);

    // Insert search permissions promise to generate decison
    if (action && resource) {
      const search_permissions = search_roles.then(function (roles) {
        return user_permissions(roles.all, user_info.app_id, action, resource, authorization_service_header);
      });
      promise_array.push(search_permissions);
    } else if (config_authzforce.enabled && authzforce) {
      // Search authzforce if level 3 of security is enabled
      const search_authzforce = app_authzforce_domain(user_info.app_id);
      promise_array.push(search_authzforce);
    }

    Promise.all(promise_array)
      .then(function (values) {
        const trusted_apps = values[0];
        const roles = values[1];

        if (req_app) {
          if (req_app !== user_info.app_id) {
            if (trusted_apps.includes(user_info.app_id) === false) {
              reject({
                message: 'User not authorized in application',
                code: 401,
                title: 'Unauthorized'
              });
            }
          }
        }

        if (action && resource) {
          if (values[2] && values[2].length > 0) {
            user_info.authorization_decision = 'Permit';
          } else {
            user_info.authorization_decision = 'Deny';
          }
        } else if (config_authzforce.enabled && authzforce) {
          const authzforce_domain = values[2];
          if (authzforce_domain) {
            user_info.app_azf_domain = authzforce_domain.az_domain;
          }
        }

        user_info.roles = roles.user;
        user_info.organizations = roles.organizations;
        user_info.trusted_apps = trusted_apps;

        resolve(user_info);
      })
      .catch(function (error) {
        debug('Error: ', error);
        reject({
          message: 'Internal error',
          code: 500,
          title: 'Internal error'
        });
      });
  });
}

// Search user roles in application
function user_roles(user_id, app_id) {
  debug('-------user_roles-------');

  const promise_array = [];

  // Search organizations in wich user is member or owner
  promise_array.push(
    models.user_organization.findAll({
      where: { user_id },
      include: [
        {
          model: models.organization,
          attributes: ['id']
        }
      ]
    })
  );

  // Search roles for user or the organization to which the user belongs
  promise_array.push(
    promise_array[0].then(function (organizations) {
      const search_role_organizations = [];
      if (organizations.length > 0) {
        for (let i = 0; i < organizations.length; i++) {
          search_role_organizations.push({
            organization_id: organizations[i].organization_id,
            role_organization: organizations[i].role
          });
        }
      }
      return models.role_assignment.findAll({
        where: {
          [Op.or]: [{ [Op.or]: search_role_organizations }, { user_id }],
          oauth_client_id: app_id,
          role_id: { [Op.notIn]: ['provider', 'purchaser'] }
        },
        include: [
          {
            model: models.user,
            attributes: ['id', 'username', 'email', 'gravatar']
          },
          {
            model: models.role,
            attributes: ['id', 'name']
          },
          {
            model: models.organization,
            attributes: ['id', 'name', 'description', 'website']
          }
        ]
      });
    })
  );

  return Promise.all(promise_array)
    .then(function (values) {
      const role_assignment = values[1];

      const user_app_info = { user: [], organizations: [], all: [] };

      for (let i = 0; i < role_assignment.length; i++) {
        const role = role_assignment[i].Role.dataValues;

        user_app_info.all.push(role.id);

        if (role_assignment[i].Organization) {
          const organization = role_assignment[i].Organization.dataValues;
          const index = user_app_info.organizations
            .map(function (e) {
              return e.id;
            })
            .indexOf(organization.id);

          if (index < 0) {
            organization.roles = [role];
            user_app_info.organizations.push(organization);
          } else {
            user_app_info.organizations[index].roles.push(role);
          }
        }

        if (role_assignment[i].User) {
          user_app_info.user.push(role);
        }
      }
      return Promise.resolve(user_app_info);
    })
    .catch(function (error) {
      debug('Error: ', error);
      return Promise.reject({
        message: 'Internal error',
        code: 500,
        title: 'Internal error'
      });
    });
}

// Search user permissions in application whose action and resource are recieved from Pep Proxy
function user_permissions(roles_id, app_id, action, resource, authorization_service_header) {
  debug('-------user_permissions-------');
  return models.role_permission
    .findAll({
      where: { role_id: roles_id },
      attributes: ['permission_id']
    })
    .then(function (permissions) {
      if (permissions.length > 0) {
        return models.permission
          .findAll({
            where: {
              id: permissions.map((elem) => elem.permission_id),
              oauth_client_id: app_id,
              action
            }
          })
          .then((permissions) =>
            permissions.filter((permission) => {
              return (
                (permission.is_regex === 1
                  ? new RegExp(permission.resource).exec(resource)
                  : permission.resource === resource) &&
                (permission.use_authorization_service_header === 1
                  ? permission.authorization_service_header === authorization_service_header
                  : true)
              );
            })
          );
      }
      return [];
    });
}

// Search Trusted applications
function trusted_applications(app_id) {
  debug('-------trusted_applications-------');

  return models.trusted_application
    .findAll({
      where: { oauth_client_id: app_id },
      attributes: ['trusted_oauth_client_id']
    })
    .then(function (trusted_apps) {
      if (trusted_apps.length > 0) {
        return trusted_apps.map((id) => id.trusted_oauth_client_id);
      }
      return [];
    });
}

// Search authzforce domain for specific application
function app_authzforce_domain(app_id) {
  debug('-------app_authzforce_domain-------');

  return models.authzforce.findOne({
    where: { oauth_client_id: app_id },
    attributes: ['az_domain']
  });
}

function validateScope(user, client, scope) {
  debug('-------validateScope-------');

  if (scope && scope.length > 0) {
    const requested_scopes = typeof scope === "string" ? scope.split(',') : scope[0].split(',');
    if (requested_scopes.includes('bearer') && requested_scopes.includes('jwt')) {
      return false;
    }
    if (requested_scopes.includes('permanent') || requested_scopes.includes('jwt')) {
      return requested_scopes.every((r) => client.token_types.includes(r)) ? requested_scopes : false;
    }
    if (requested_scopes.includes('openid')) {
      return client.scope.includes('openid') ? requested_scopes : false;
    }
    return requested_scopes;
  }
  return ['bearer'];
}

function verifyScope(token, scope) {
  debug('-------verifyScope-------');

  return token.scope === scope;
}

/// OPEN ID CONNECT FUNCTIONS

function generateIdToken(client, user) {
  debug('-------generateIdToken-------');

  let user_autho_app_promise = config_oauth2.ask_authorization
    ? user_authorized_application.findOrCreate({
        // User has enable application to read their information
        where: { user_id: user.id, oauth_client_id: client.id },
        defaults: {
          user_id: user.id,
          oauth_client_id: client.id
        }
      })
    : Promise.resolve();

  return user_autho_app_promise
    .then(function () {
      return create_oauth_response(user, client.id, null, null, config_authzforce.enabled, null);
    })
    .then(function (idToken) {
      idToken['iss'] = config.host;
      idToken['sub'] = user.id;
      idToken['aud'] = client.id;
      idToken['exp'] = Math.round(Date.now() / 1000) + config_oauth2.access_token_lifetime;
      idToken['iat'] = Math.round(Date.now() / 1000);
      return idToken;
    })
    .catch(function (error) {
      debug('-------generateidToken-------', error);
    });
}

module.exports = {
  getAccessToken,
  getAuthorizationCode,
  getClient,
  getRefreshToken,
  getUser,
  getIdentity,
  getUserFromClient,
  revokeAuthorizationCode,
  revokeRefreshToken,
  revokeAccessToken,
  saveToken,
  saveAuthorizationCode,
  validateScope,
  verifyScope,
  create_oauth_response,
  user_roles,
  user_permissions,
  trusted_applications,
  generateIdToken
};

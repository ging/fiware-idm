// Model to create Oauth2 server
var models = require('./models.js');
var oauth2 = require('../config').oauth2;
var _ = require('lodash');
var debug = require('debug')('idm:oauth2-model_oauth_server')

var user = models.user;
var iot = models.iot;
var role_assignment = models.role_assignment;
var oauth_client = models.oauth_client;
var oauth_access_token = models.oauth_access_token;
var oauth_authorization_code = models.oauth_authorization_code;
var oauth_refresh_token = models.oauth_refresh_token;

function getAccessToken(bearerToken) {
  
  debug("-------getAccesToken-------")
  
  return oauth_access_token
    .findOne({
      where: {access_token: bearerToken},
      attributes: [['access_token', 'accessToken'], ['expires', 'accessTokenExpiresAt'],'scope'],
      include: [
        {
          model: user,
          attributes: ['id', 'username', 'email'],
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
    where: {id: clientId, secret: clientSecret},
    attributes: ['id', 'redirect_uri', 'scope', 'grant_type']
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
    attributes: ['id', 'username', 'password', 'scope'],
  })

  var search_iot = iot.findOne({
    where: {id: id},
    attributes: ['id', 'password'],
  })

  return Promise.all([search_user, search_iot]).then(function(values) {

    var user = values[0]
    var iot = values[1]

    if ((user && iot) || (!user && !iot)) {
      return false
    }

    if (user) {
      if (user.verifyPassword(password)) {
          return user
        } 
    }

    if (iot) {
      if (iot.verifyPassword(password)) {
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
        if (user.verifyPassword(password)) {
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
    //if(rCode) rCode.destroy();
    /***
     * As per the discussion we need set older date
     * revokeToken will expected return a boolean in future version
     * https://github.com/oauthjs/node-oauth2-server/pull/274
     * https://github.com/oauthjs/node-oauth2-server/issues/290
     */
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
    /***
     * As per the discussion we need set older date
     * revokeToken will expected return a boolean in future version
     * https://github.com/oauthjs/node-oauth2-server/pull/274
     * https://github.com/oauthjs/node-oauth2-server/issues/290
     */
    var expiredToken = token
    expiredToken.refreshTokenExpiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredToken
  }).catch(function (err) {
    debug("revokeToken - Err: ", err)
  });
}

function saveToken(token, client, identity) {

  debug("-------saveToken-------")

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

    ])
    .then(function (resultsArray) {
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
      var client = authCodeModel.OauthClient.toJSON()
      var user = authCodeModel.User.toJSON()
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
      attributes: ['client_id', 'user_id', 'expires'],
      where: {refresh_token: refreshToken},
      include: [oauth_client, user]

    })
    .then(function (savedRT) {
      var tokenTemp = {
        user: savedRT ? savedRT.User.toJSON() : {},
        client: savedRT ? savedRT.OAuthClient.toJSON() : {},
        refreshTokenExpiresAt: savedRT ? new Date(savedRT.expires) : null,
        refreshToken: refreshToken,
        refresh_token: refreshToken,
        scope: savedRT.scope
      };
      return tokenTemp;

    }).catch(function (err) {
      debug("getRefreshToken - Err: ", err)
    });
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
  // validateScope: validateScope,
  // verifyScope: verifyScope,
}


// Model to create Oauth2 server
var models = require('./models.js');
var _ = require('lodash');

var user = models.user;
var iot = models.iot;
var pep_proxy = models.pep_proxy;
var role_user = models.role_user;
var oauth_client = models.oauth_client;
var oauth_access_token = models.oauth_access_token;
var oauth_access_token_pep_proxy = models.oauth_access_token_pep_proxy;
var oauth_authorization_code = models.oauth_authorization_code;
var oauth_refresh_token = models.oauth_refresh_token;

function getAccessToken(bearerToken) {
  console.log("-------getAccesToken-------")
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
          model: pep_proxy,
          attributes: ['id'],
        },
        {
          model: iot,
          attributes: ['id'],
        },
        {
          model: oauth_client,
          attributes: ['id']
        }
      ],
    })
    .then(function (accessToken) {
      if (!accessToken) return false;
      var token = accessToken.toJSON();
      if (accessToken.User) {
        token.user = accessToken.User;
      } else if (accessToken.Iot) {
        token.iot = accessToken.Iot;
      } else if (accessToken.PepProxy) {
        token.pep_proxy = accessToken.PepProxy; 
      }
      delete token.User 
      delete token.PepProxy 
      delete token.Iot
      token.application = accessToken.OauthClient;
      //token.scope = token.scope
      return token;
    })
    .catch(function (err) {
      console.log("getAccessToken - Err: "+ err)
    });
}

function getClient(clientId, clientSecret) {
  console.log("-------getClient-------")
  const options = {
    where: {id: clientId},
    attributes: ['id', 'redirect_uri', 'scope', 'grant_type']
  };
  if (clientSecret) options.where.secret = clientSecret;

  return oauth_client
    .findOne(options)
    .then(function (client) {
      if (!client) return new Error("client not found");
      var clientWithGrants = client.toJSON()
      clientWithGrants.grants = [clientWithGrants.grant_type]
      delete clientWithGrants.grant_type
      // Todo: need to create another table for redirect URIs
      clientWithGrants.redirectUris = [clientWithGrants.redirect_uri]
      delete clientWithGrants.redirect_uri
      //clientWithGrants.refreshTokenLifetime = integer optional
      //clientWithGrants.accessTokenLifetime  = integer optional
      return clientWithGrants
    }).catch(function (err) {
      console.log("getClient - Err: ", err)
    });
}

function getUserFromEmail(email) {
  console.log("-------getUserFromEmail-------")
  return user
    .findOne({
      where: {email: email},
      attributes: ['id', 'username', 'password', 'scope'],
    })
    .then(function (user) {
      return user.toJSON();
    })
    .catch(function (err) {
      console.log("getUser - Err: ", err)
    });
}

function getUser(username, password) {
  console.log("-------getUser-------")
  return user
    .findOne({
      where: {username: username},
      attributes: ['id', 'username', 'password', 'scope'],
    })
    .then(function (user) {
      return user.verifyPassword(password) ? user.toJSON() : false;
    })
    .catch(function (err) {
      console.log("getUser - Err: ", err)
    });
}

function getIotSensor(id, password) {
  console.log("-------getIotSensor-------")
  return iot
    .findOne({
      where: {id: id},
      attributes: ['id', 'password'/*, 'scope'*/],
    })
    .then(function(iot) {
      return iot.verifyPassword(password) ? iot.toJSON() : false;
    })
    .catch(function (err) {
      console.log("getIot - Err: ", err)
    });
}

function getPepProxy(id, password) {
  console.log("-------getPepProxy-------")
  return pep_proxy
    .findOne({
      where: {id: id},
      attributes: ['id', 'password'/*, 'scope'*/],
    })
    .then(function(pep_proxy) {
      return pep_proxy.verifyPassword(password) ? pep_proxy.toJSON() : false;
    })
    .catch(function (err) {
      console.log("getPepProxy - Err: ", err)
    });
}

function revokeAuthorizationCode(code) {
  console.log("-------revokeAuthorizationCode-------")
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
    console.log("getUser - Err: ", err)
  });
}

function revokeToken(token) {
  console.log("-------revokeToken-------")
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
    console.log("revokeToken - Err: ", err)
  });
}

function saveToken(token, client, user, pep_proxy, iot) {
  console.log("-------saveToken-------")
  return Promise.all([
      oauth_access_token.create({
        access_token: token.accessToken,
        expires: token.accessTokenExpiresAt,
        oauth_client_id: client.id,
        user_id: (user) ? user.id : null,
        pep_proxy_id: (pep_proxy) ? pep_proxy.id : null,
        iot_id: (iot) ? iot.id : null,
        scope: token.scope
      }),
      token.refreshToken ? oauth_refresh_token.create({ // no refresh token for client_credentials
        refresh_token: token.refreshToken,
        expires: token.refreshTokenExpiresAt,
        oauth_client_id: client.id,
        user_id: (user) ? user.id : null,
        pep_proxy_id: (pep_proxy) ? pep_proxy.id : null,
        iot_id: (iot) ? iot.id : null,
        scope: token.scope
      }) : [],

    ])
    .then(function (resultsArray) {
      return _.assign(  // expected to return client and user, but not returning
        {
          client: client,
          user: (user) ? user : null,
          iot: (iot) ? iot : null,
          pep_proxy: (pep_proxy) ? pep_proxy : null,
          access_token: token.accessToken, // proxy
          refresh_token: token.refreshToken, // proxy
        },
        token
      )
    })
    .catch(function (err) {
      console.log("revokeToken - Err: ", err)
    });
}

function getAuthorizationCode(code) {
  console.log("-------getAuthorizationCode-------")
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
      console.log("getAuthorizationCode - Err: ", err)
    });
}

function saveAuthorizationCode(code, client, user) {
  console.log("-------saveAuthorizationCode-------")
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
      console.log("saveAuthorizationCode - Err: ", err)
    });
}


function getUserFromClient(client) {
  console.log("-------getUserFromClient-------")
  var options = {
    where: {oauth_client_id: client.id},
    include: [user]
  };
  //if (client.client_secret) options.where.secret = client.client_secret;

  return role_user
    .findOne(options)
    .then(function (role_user) {
      if (!role_user) return false;
      if (!role_user.User) return false;
      return role_user.User.toJSON();
    }).catch(function (err) {
      console.log("getUserFromClient - Err: ", err)
    });
}

function getRefreshToken(refreshToken) {
  console.log("-------getRefreshToken-------")
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
      console.log("getRefreshToken - Err: ", err)
    });
}

// function validateScope(token, client) {
//   console.log("-------validateScope-------")
//   return (user.scope === scope && client.scope === scope && scope !== null) ? scope : false
// }

// function verifyScope(token, scope) {
//   console.log("-------verifyScope-------")
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
  getUserFromEmail: getUserFromEmail,
  getUser: getUser,
  getIotSensor: getIotSensor,
  getPepProxy: getPepProxy,
  getUserFromClient: getUserFromClient,
  //grantTypeAllowed, Removed in oauth2-server 3.0
  revokeAuthorizationCode: revokeAuthorizationCode,
  revokeToken: revokeToken,
  saveToken: saveToken,//saveOAuthAccessToken, renamed to
  saveAuthorizationCode: saveAuthorizationCode, //renamed saveOAuthAuthorizationCode,
  // validateScope: validateScope,
  // verifyScope: verifyScope,
}


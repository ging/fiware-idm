const crypto = require('crypto');
const debug = require('debug')('idm:extparticipant_controller');
const moment = require('moment');
const oauth2_server = require('oauth2-server');
const uuid = require('uuid');

const config_service = require('../../lib/configService.js');
const models = require('../../models/models.js');
const authregistry = require('../../controllers/authregistry/authregistry');
const utils = require('./utils');

const config = config_service.get_config();

const m2m_grant_type = "urn:ietf:params:oauth:grant-type:jwt-bearer";
const managed_token_grant_types = new Set(["authorization_code", "client_credentials", m2m_grant_type]);


async function build_id_token(client, user, scopes, nonce, auth_time) {
  const now = moment();
  if (auth_time == null) {
    auth_time = now.unix();
  }

  const claims = {
    iss: config.pr.client_id,
    sub: user.id, // TODO
    aud: client.id,
    exp: now.clone().add(config.oauth2.access_token_lifetime, 'seconds').unix(),
    iat: now.unix(),
    auth_time,
    acr: "urn:http://eidas.europa.eu/LoA/NotNotified/low",
    azp: client.id
  };

  if (nonce != null) {
    claims.nonce = nonce;
  }

  if (scopes.has("profile")) {
    Object.assign(claims, {
      preferred_username: user.username,
      website: user.website
    });
  }

  if (scopes.has("email")) {
    claims.email = user.email;
  }

  return await utils.create_jwt(claims);
}

async function build_access_token(client, user, grant_type) {
  const now = moment();
  const exp = now.clone().add(config.oauth2.access_token_lifetime, 'seconds');

  /* eslint-disable snakecase/snakecase */
  const claims = {
    iss: config.pr.client_id,
    sub: grant_type === m2m_grant_type ? user.username : user.id, // TODO
    jti: uuid.v4(),
    iat: now.unix(),
    exp: exp.unix(),
    aud: grant_type === m2m_grant_type ? config.pr.client_id : client.id
  };
  if (grant_type !== m2m_grant_type) {
    claims.email = user.email;
    if (config.ar.url != null && config.ar.url !== "internal") {
      claims.authorisationRegistry = {
        url: config.ar.url,
        token_endpoint: config.ar.token_endpoint,
        delegation_endpoint: config.ar.delegation_endpoint,
        identifier: config.ar.identifier
      };
    } else if (config.ar.url === "internal") {
      claims.delegationEvidence = await authregistry.get_delegation_evidence(user.id);
    }
  }
  /* eslint-enable snakecase/snakecase */

  return [
    await utils.create_jwt(claims),
    exp.toDate()
  ];
}

const ensure_client_application = async function ensure_client_application(participant_id, participant_name, redirect_uri) {
  const data = {
    id: participant_id,
    name: participant_name,
    image: 'i4trust_party.png',
    grant_type: [
      'client_credentials',
      'authorization_code',
      'refresh_token'
    ],
    description: `You are accessing from ${participant_name}. This is a trusted iSHARE participant registered with id "${participant_id}".`,
    response_type: ['code'],
  };
  if (redirect_uri) {
      data.redirect_uri = redirect_uri;
  }

  // We cannot use upsert for retrieving the updated client due very old version of sequelize
  await models.oauth_client.upsert(data);
  return await models.oauth_client.findOne({where: {id: participant_id}});
};

async function _validate_participant(req, res) {
  const scopes = new Set(req.body.scope != null ? req.body.scope.split(' ') : []);
  if (!scopes.has('iSHARE')) {
    return false;
  }

  if (!req.body.response_type || req.body.response_type !== 'code') {
    throw new oauth2_server.InvalidRequestError('invalid_request: response_type not valid or not exist');
  } else if (!req.body.client_id) {
    throw new oauth2_server.InvalidRequestError('Missing parameter: `client_id`');
  }

  debug('using external participant registry flow');

  const credentials = req.body.request;
  if (!credentials) {
    throw new oauth2_server.InvalidRequestError('Missing parameter: `request`');
  }

  /*******/
  debug('Validating JWT token of the client (including the certificates)');
  /*******/

  // Validate the JWT and client certificates
  const [client_payload, client_certificate] = await utils.assert_client_using_jwt(credentials, req.body.client_id);

  const participant_name = await utils.validate_participant_from_jwt(client_payload, client_certificate);

  /*******/
  debug('Participant successfully validated');
  /*******/

  await ensure_client_application(client_payload.iss, participant_name, client_payload.redirect_uri);

  const auth_params = new URLSearchParams();
  auth_params.append('response_type', 'code');
  auth_params.append('client_id', client_payload.client_id || client_payload.iss);
  auth_params.append('scope', client_payload.scope);
  auth_params.append('redirect_uri', client_payload.redirect_uri);
  auth_params.append('state', client_payload.state);
  auth_params.append('nonce', client_payload.nonce);

  res.status(204).location('/oauth2/authorize?' + auth_params).end();
  return true;
}

async function _token(req, res) {

  if (!req.is('application/x-www-form-urlencoded')) {
    throw new oauth2_server.InvalidRequestError(`Invalid request: content must be application/x-www-form-urlencoded [${req.headers}]`);
  }

  const grant_type = req.body.grant_type;
  const client_id = req.body.client_id;

  // Skip normal flows
  // https://datatracker.ietf.org/doc/html/rfc7523#section-2.2
  if (!managed_token_grant_types.has(grant_type) || req.body.client_assertion_type !== 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer') {
    return false;
  }

  debug('using external participant registry flow');

  if (grant_type === "authorization_code" && !req.body.code) {
    throw new oauth2_server.InvalidRequestError('Missing parameter: `code`');
  }

  if (typeof req.body.client_assertion !== "string") {
    // Reponse with message
    throw new oauth2_server.InvalidRequestError('invalid_request: include client_assertion in request');
  }

  // Validate client
  const [client_payload, client_certificate] = await utils.assert_client_using_jwt(req.body.client_assertion, client_id);

  let id_token = null;
  let client;
  let user;
  let scopes;
  if (grant_type === "authorization_code") {

    debug('Validating authorization code');

    const code = await models.oauth_authorization_code
      .findOne({
        attributes: ['oauth_client_id', 'redirect_uri', 'expires', 'user_id', 'scope', 'extra'],
        where: { authorization_code: req.body.code, oauth_client_id: client_id, valid: true },
        include: [models.user, models.oauth_client]
      });

    if (!code) {
      throw new oauth2_server.InvalidRequestError('Invalid grant: authorization code is invalid');
    }

    if (code.expires < new Date()) {
      throw new oauth2_server.InvalidGrantError('Invalid grant: authorization code has expired');
    }

    if (req.body.redirect_uri !== code.redirect_uri) {
      throw new oauth2_server.InvalidRequestError('Invalid request: `redirect_uri` is invalid');
    }

    debug('Authorization code validated, marking it as invalid so it cannot be used anymore');

    // Invalidate the code
    code.authorization_code = req.body.code;
    code.valid = false;
    code.save();

    // Build id and access tokens
    scopes = new Set(code.scope.split(/[,\s]+/));
    client = code.OauthClient;
    user = code.User;
    id_token = await build_id_token(client, user, scopes, code.nonce, code.extra.iat);
  } else {
    const participant_name = await utils.validate_participant_from_jwt(client_payload, client_certificate);

    /*******/
    debug('Participant successfully validated');
    /*******/

    client = await ensure_client_application(client_payload.iss, participant_name, client_payload.redirect_uri);
    // We cannot use upsert for retrieving the updated client due very old version of sequelize
    await models.user.upsert({
      username: client_payload.iss,
      description: `External participant with id: ${client_payload.iss}`,
      email: `${client_id}@${config.pr.url}`,
    }, {
      validate: false // Currently, we are inserting an invalid email address for the participant
    });

    scopes = new Set(req.body.scope != null ? req.body.scope.split(/[,\s]+/) : []);
    user = await models.user.findOne({where: {username: client_payload.iss}});
    if (grant_type === "client_credentials") {
      // Build id and access tokens
      id_token = await build_id_token(client, user, scopes);
    }
  }

  // Create and save access_token
  const [access_token, access_token_exp] = await build_access_token(client, user, grant_type);
  await models.oauth_access_token.create({
      hash: crypto.createHash("sha3-256").update(access_token).digest('hex'),
      access_token,
      expires: access_token_exp,
      valid: true,
      oauth_client_id: client.id,
      user_id: user.id,
      authorization_code: req.body.code,
      scope: scopes
  });

  const response = {
    access_token,
    expires_in: config.oauth2.access_token_lifetime,
    token_type: "Bearer"
  };

  if (id_token != null) {
    response.id_token = id_token;
  }

  // Return id and access tokens
  res.status(200).json(response);
  
  return true;
}

exports.validate_participant = function validate_participant(req, res, next) {
  debug(' --> validate_participant');

  _validate_participant(req, res).then(
    (skip) => {
      if (!skip) {
        next();
      }
    },
    (err) => {
      if (err instanceof oauth2_server.OAuthError) {
        debug('Error ', err.message);
        if (err.details) {
          debug('Due: ', err.details);
        }
        res.status(err.status = err.code);

        res.locals.error = err;
        res.render('errors/oauth', {
          query: req.body,
          application: req.application
        });
      } else {
        throw err;
      }
    }
  );
};

exports.token = function token(req, res, next) {
  debug(' --> token');

  _token(req, res).then(
    (skip) => {
      if (!skip) {
        next();
      }
    },
    (err) => {
      if (err instanceof oauth2_server.OAuthError) {
        debug('Error ', err.message);
        if (err.details) {
          debug('Due: ', err.details);
        }
        res.status(err.status = err.code);

        res.locals.error = err;
        res.render('errors/oauth', {
          query: req.body,
          application: req.application
        });
      } else {
        throw err;
      }
    }
  );
};

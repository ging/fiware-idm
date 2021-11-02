const crypto = require('crypto');
const debug = require('debug')('idm:extparticipant_controller');
const fetch = require('node-fetch');
const forge = require('node-forge');
const jose = require('node-jose');
const moment = require('moment');
const oauth2_server = require('oauth2-server');
const uuid = require('uuid');

const config_service = require('../../lib/configService.js');
const models = require('../../models/models.js');
const authregistry = require('../../controllers/authregistry/authregistry');
const utils = require('./utils');

const config = config_service.get_config();
const verifier = jose.JWS.createVerify();


function check(errors, condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function validate_client_certificate(cert) {
  const errors = [];

  const id = cert.subject.attributes.map((a) => {
    const name = a.shortName || a.name;
    return `${name}=${a.value}`;
  }).join('/');
  debug(`Validating ${id}`);

  //check(errors, cert.validity.notBefore <= periodStart && periodEnd <= cert.validity.notAfter, "Certificate dates invalid.");
  //check(errors, await IsCertificatePartOfChain(cert), "Certificate is not part of the chain.");
  check(errors, cert.signatureOid === forge.pki.oids.sha256WithRSAEncryption, "Certificate signature invalid.");
  //check(errors, cert.publicKey.Key.SignatureAlgorithm == "RSA", "RSA algorithm");
  check(errors, cert.publicKey.n.bitLength() >= 2048, "Certificate public key size is smaller than 2048.");
  check(errors, cert.serialNumber != null && cert.serialNumber.trim() !== "", "Certificate has no serial number");

  const key_usage = cert.getExtension('keyUsage');
  const digital_only = key_usage.digitalSignature && !(key_usage.keyCertSign || key_usage.cRLSign);
  check(errors, digital_only, "Key usage is for CA and not for digital signature.");

  if (errors.length > 0) {
      throw new Error(errors);
  }
}

async function assert_client_using_jwt(credentials, client_id) {
  try {
    // parse the JWT and verify its signature
    const jwt = await verifier.verify(credentials, { 'allowEmbeddedKey': true });
    const payload = JSON.parse(jwt.payload.toString());

    // check JWT parameters
    if (payload.iss !== client_id) {
      throw new Error(`JWT iss parameter doesn't match provided client_id parameter (${payload.iss} != ${client_id})`);
    }

    const aud = typeof payload.aud === "string" ? [payload.aud] : payload.aud;
    if (aud == null || aud.indexOf(config.pr.client_id) === -1) {
      throw new Error("Not listed on the aud parameter");
    }
    const now = moment().unix();
    if (payload.exp < now) {
      throw new Error("Expired token");
    }

    // Validate chain certificates
    const fullchain = jwt.header.x5c.map((cert) => {
      return forge.pki.certificateFromPem(
        '-----BEGIN CERTIFICATE-----' + cert + '-----END CERTIFICATE-----'
      );
    });

    const cert_serial_name = fullchain[0].subject.getField({name: "serialName"}).value;
    if (payload.iss !== cert_serial_name) {
      // JWT iss parameter does not match the serialName field of the signer certificate
      throw new Error(`Issuer certificate serialName parameter does not match jwt iss parameter (${payload.iss} != ${cert_serial_name})`);
    }
    validate_client_certificate(fullchain[0]);

    return [payload, fullchain[0]];
  } catch (e) {
    // Reponse with message
    const err = new oauth2_server.InvalidRequestError('invalid_request: invalid client credentials');
    err.details = e;
    throw err;
  }
}

async function build_id_token(client, user, scopes, nonce, iat) {
  const now = moment();
  if (iat == null) {
    iat = now.unix();
  }

  const claims = {
    iss: config.pr.client_id,
    sub: user.id, // TODO
    aud: client.id,
    exp: now.add(30, 'seconds').unix(),
    iat: now.unix(),
    auth_time: iat,
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

async function build_access_token(client, user) {
  const now = moment();
  const exp = now.add(config.oauth2.access_token_lifetime, 'seconds');

  /* eslint-disable snakecase/snakecase */
  const claims = {
    iss: config.pr.client_id,
    sub: user.id, // TODO
    jti: uuid.v4(),
    iat: now.unix(),
    exp: exp.unix(),
    aud: client.id,
    email: user.email
  };
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
  /* eslint-enable snakecase/snakecase */

  return [
    await utils.create_jwt(claims),
    exp.toDate()
  ];
}

async function retrieve_participant_registry_token() {
  const now = moment();
  const iat = now.unix();
  const exp = now.add(30, 'seconds').unix();
  const payload = {
    jti: uuid.v4(),
    iss: config.pr.client_id,
    sub: config.pr.client_id,
    aud: [
        "EU.EORI.NL000000000",
        config.pr.token_endpoint
    ],
    iat,
    exp
  };

  return await utils.create_jwt(payload);
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

const validate_participant_from_jwt = async function validate_participant_from_jwt(client_payload, client_certificate) {
  /*******/
  debug('Generating a JWT token for accessing the participant registry');
  /*******/
  const token = await retrieve_participant_registry_token();

  /*******/
  debug('Requesting an access token to the participant registry');
  /*******/

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('scope', 'iSHARE');
  params.append('client_id', config.pr.client_id);
  params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
  params.append('client_assertion', token);

  debug('url: ' + config.pr.token_endpoint);
  debug('body: ' + params);
  const token_response = await fetch(config.pr.token_endpoint, {
    method: 'post',
    body: params
  });
  if (token_response.status !== 200) {
    throw new oauth2_server.ServerError('internal error: unable to validate client as participant');
  }

  const access_token = (await token_response.json()).access_token;

  /*******/
  debug('Querying participant registry if the client is a valid participant');
  /*******/

  const parties_params = new URLSearchParams();
  const subject = [];
  client_certificate.subject.attributes.forEach((a) => subject.push((a.shortName ? a.shortName : "SERIALNUMBER") + "=" + a.value));
  parties_params.append("eori", client_payload.iss);
  parties_params.append("certificate_subject_name", subject.join(", "));
  parties_params.append("active_only", "true");

  debug('url: ' + config.pr.parties_endpoint + '?' + parties_params);
  const parties_response = await fetch(config.pr.parties_endpoint + '?' + parties_params, {
    headers: {
      "Authorization": "Bearer " + access_token
    },
  });
  if (parties_response.status !== 200) {
    throw new oauth2_server.ServerError('internal error: unable to validate client as participant');
  }

  const parties_token = (await parties_response.json()).parties_token;
  const parties_jwt = (await verifier.verify(parties_token, { 'allowEmbeddedKey': true}));
  const parties_info = JSON.parse(parties_jwt.payload.toString()).parties_info;
  debug("response: ", JSON.stringify(parties_info, null, 4));
  if (parties_info.count !== 1 || parties_info.data[0].adherence.status !== "Active") {
    // Reponse with message
    throw new oauth2_server.InvalidRequestError('internal error: client is not a trusted participant');
  }

  return parties_info.data[0].party_name;
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
  const [client_payload, client_certificate] = await assert_client_using_jwt(credentials, req.body.client_id);

  const participant_name = await validate_participant_from_jwt(client_payload, client_certificate);

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
  if (grant_type !== "authorization_code" && grant_type !== "client_credentials" || req.body.client_assertion_type !== 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer') {
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
  const [client_payload, client_certificate] = await assert_client_using_jwt(req.body.client_assertion, client_id);

  let id_token;
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
    const participant_name = await validate_participant_from_jwt(client_payload, client_certificate);

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
    user = await models.user.findOne({where: {username: client_payload.iss}});
    // Build id and access tokens
    scopes = new Set(req.body.scope != null ? req.body.scope.split(/[,\s]+/) : []);
    id_token = await build_id_token(client, user, scopes);
  }

  // Create and save access_token
  const [access_token, access_token_exp] = await build_access_token(client, user);
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

  // Return id and access tokens
  res.status(200).json({
    id_token,
    access_token,
    expires_in: config.oauth2.access_token_lifetime,
    token_type: "Bearer"
  });
  
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

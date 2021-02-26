const crypto = require('crypto');
const debug = require('debug')('idm:i4trust_controller');
const fetch = require('node-fetch');
const forge = require('node-forge');
const jose = require('node-jose');
const moment = require('moment');
const uuid = require('uuid');

const config_service = require('../../lib/configService.js');
const models = require('../../models/models.js');

const config = config_service.get_config();
const verifier = jose.JWS.createVerify();
const crt_regex = /^-----BEGIN CERTIFICATE-----\n([\s\S]+?)\n-----END CERTIFICATE-----$/gm;



function check(errors, condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function validate_client_certificate(cert) {
  const errors = [];

  //check(errors, cert.validity.notBefore <= periodStart && periodEnd <= cert.validity.notAfter, "Certificate dates invalid.");
  //check(errors, await IsCertificatePartOfChain(cert), "Certificate is not part of the chain.");
  check(errors, cert.signatureOid === forge.pki.oids.sha256WithRSAEncryption, "Certificate signature invalid.");
  //check(errors, cert.publicKey.Key.SignatureAlgorithm == "RSA", "RSA algorithm");
  check(errors, cert.publicKey.n.bitLength() >= 2048, "Certificate public key size is smaller than 2048.");
  check(errors, cert.serialNumber != null && cert.serialNumber.trim() !== "", "Certificate has no serial number");

  const key_usage = cert.getExtension('keyUsage');
  const digital_only = key_usage.digitalSignature && !(key_usage.keyCertSign || key_usage.cRLSign);
  check(errors, digital_only, "Key usage is for digital signature and not for CA.");

  if (errors.length > 0) {
      throw new Error(errors);
  }
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

  return await jose.JWS.createSign({
    algorithm: 'RS256',
    format: 'compact',
    fields: {
      typ: "JWT",
      x5c: config.pr.client_crt
    }
  }, config.pr.client_key).update(JSON.stringify(payload)).final();
}

async function _validate_participant(req, res) {
  const scopes = new Set(req.body.scope != null ? req.body.scope.split(' ') : []);
  if (!scopes.has('i4trust') && !scopes.has('iSHARE')) {
    return;
  }

  if (!req.body.response_type || req.body.response_type !== 'code') {
    // Reponse with message
    const err = new Error('invalid_request: response_type not valid or not exist');
    err.status = 400;
    debug('Error ', err.message);

    res.locals.error = err;
    throw res.render('errors/oauth', {
      query: req.body,
      application: req.application
    });
  } else if (!req.body.client_id) {
    // Reponse with message
    const err = new Error('invalid_request: include client_id in request');
    err.status = 400;
    debug('Error ', err.message);

    res.locals.error = err;
    throw res.render('errors/oauth', {
      query: req.body,
      application: req.application
    });
  }

  debug('using i4Trust flow');

  // Prepare our private key to be able to create JWSs
  if (typeof config.pr.client_key === "string") {
    debug('preparing Participant Key & client certificate');
    config.pr.client_key = await jose.JWK.asKey(config.pr.client_key, "pem");
    if (config.pr.client_crt.indexOf("-----BEGIN CERTIFICATE-----") !== -1) {
      const str = config.pr.client_crt;
      config.pr.client_crt = [];
      let m;
      while ((m = crt_regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === crt_regex.lastIndex) {
          crt_regex.lastIndex++;
        }
	config.pr.client_crt.push(m[1].replace(/\n/g, ""));
      }
    } else {
      config.pr.client_crt = [config.pr.client_crt.replace(/\n/g, "")];
    }
  }

  const credentials = req.body.request;
  if (!credentials) {
      // Reponse with message
      const err = new Error('invalid_request: request parameter missing or invalid');
      err.status = 400;
      debug('Error ', err.message);

      res.locals.error = err;
      throw res.render('errors/oauth', {
        query: req.query,
        application: req.application
      });
  }

  // Step 7: Validate the JWT and the certificate chain provided in
  // the header
  let client_jwt;
  let client_certificate;
  let client_payload;
  try {
    debug('step 7.1');
    client_jwt = await verifier.verify(credentials, { 'allowEmbeddedKey': true });
    debug('step 7.2');
    client_payload = JSON.parse(client_jwt.payload.toString());
    const aud = typeof client_payload.aud === "string" ? [client_payload.aud] : client_payload.aud;
    if (aud == null || aud.indexOf(config.pr.client_id) === -1) {
      throw new Error("Not listened on the aud[ience] attribute");
    }
    const now = moment().unix();
    if (client_payload.exp < now) {
      throw new Error("Expired token");
    }
    debug('step 7.3');
    client_certificate = forge.pki.certificateFromPem(
      '-----BEGIN CERTIFICATE-----' + client_jwt.header.x5c[0] + '-----END CERTIFICATE-----'
    );
    validate_client_certificate(client_certificate);
  } catch (e) {
    // Reponse with message
    const err = new Error('invalid_request: invalid client credentials');
    err.status = 400;
    debug('Error ', err.message);
    debug('due: ', e.message);

    res.locals.error = err;
    throw res.render('errors/oauth', {
      query: req.query,
      application: req.application
    });
  }

  // Step 8: Packet Delivery company Identity Provider generates an iSHARE JWT
  debug('step 8');
  const token = await retrieve_participant_registry_token();

  // Step 9: Identity Provider sends a request to the participan registry
  // `/token` endpoint. The signed JWT created in step 8 is provided with the
  // `client_assertion` parameter of the request.
  debug('step 9');
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
    // Reponse with message
    const err = new Error('internal error: unable to validate client as participant');
    err.status = 500;
    debug('Error ', err.message);
    debug('due: ', await token_response.text());

    res.locals.error = err;
    throw res.render('errors/oauth', {
      query: req.query,
      application: req.application
    });
  }

  const access_token = (await token_response.json()).access_token;

  // Step 12: Identity Provider sends a request to the `/parties` endpoint of
  // the participant registry, in order to retrieve information about the client
  // for verification of its status as iSHARE participant. The access token from
  // the previous step 11 is provided as Bearer authorization token. The request
  // contains the client EORI id as query parameter, as well as the subject name
  // as encoded in the certificate of the client.
  debug('step 12');
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
    // Reponse with message
    const err = new Error('internal error: unable to validate client as participant');
    err.status = 500;
    debug('Error ', err.message);
    debug('due: ', await parties_response.text());

    res.locals.error = err;
    throw res.render('errors/oauth', {
      query: req.query,
      application: req.application
    });
  }

  const parties_token = (await parties_response.json()).parties_token;
  const parties_jwt = (await verifier.verify(parties_token, { 'allowEmbeddedKey': true}));
  const parties_info = JSON.parse(parties_jwt.payload.toString()).parties_info;
  debug("response: ", JSON.stringify(parties_info, null, 4));
  if (parties_info.count !== 1 || parties_info.data[0].adherence.status !== "Active") {
    // Reponse with message
    const err = new Error('invalid_request: invalid client');
    err.status = 400;
    debug('Error ', err.message);

    res.locals.error = err;
    throw res.render('errors/oauth', {
      query: req.query,
      application: req.application
    });
  }

  const secret = uuid.v4();
  const jwt_secret = crypto.randomBytes(16).toString('hex').slice(0, 16);
  await models.oauth_client.upsert({
    id: client_payload.iss,
    name: client_payload.iss,
    image: 'default',
    secret,
    grant_type: [
      'client_credentials',
      'authorization_code',
      'refresh_token'
    ],
    jwt_secret,
    response_type: ['code'],
    redirect_uri: client_payload.redirect_uri
  });

  debug('i4Trust success');
  const auth_params = new URLSearchParams();
  auth_params.append('response_type', 'code');
  auth_params.append('client_id', client_payload.client_id || client_payload.iss);
  auth_params.append('scope', client_payload.scope);
  auth_params.append('redirect_uri', client_payload.redirect_uri);
  auth_params.append('state', client_payload.state);
  auth_params.append('nonce', client_payload.nonce);
  throw res.location('/oauth2/authorize?' + auth_params).status(200).json({
    client_secret: secret,
    jwt_secret
  });
}

exports.validate_participant = function validate_participant(req, res, next) {
  debug(' --> validate_participant');

  _validate_participant(req, res).then(
    next,
    (e) => {
      console.debug("cancelled i4trust flow: " + e);
    }
  );
};

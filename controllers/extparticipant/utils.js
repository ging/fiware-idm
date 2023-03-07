/* eslint-disable snakecase/snakecase */
const config_service = require('../../lib/configService.js');
const debug = require('debug')('idm:extparticipant_utils');
const fetch = require('node-fetch');
const forge = require('node-forge');
const jose = require('node-jose');
const moment = require('moment');
const oauth2_server = require('oauth2-server');
const uuid = require('uuid');

const config = config_service.get_config();

const crt_regex = /^-----BEGIN CERTIFICATE-----\n([\s\S]+?)\n-----END CERTIFICATE-----$/gm;
exports.verifier = jose.JWS.createVerify();
const root_ca_store = forge.pki.createCaStore();

const ensure_client_key_is_ready = async function ensure_client_key_is_ready() {
  if (typeof config.pr.client_key === 'string') {
    debug('preparing Participant Key & client certificate');
    config.pr.client_key = await jose.JWK.asKey(config.pr.client_key, 'pem');
    if (config.pr.client_crt.indexOf('-----BEGIN CERTIFICATE-----') !== -1) {
      const str = config.pr.client_crt;
      config.pr.client_crt = [];
      let m;
      while ((m = crt_regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === crt_regex.lastIndex) {
          crt_regex.lastIndex++;
        }
        config.pr.client_crt.push(m[1].replace(/\n/g, ''));
      }
    } else {
      config.pr.client_crt = [config.pr.client_crt.replace(/\n/g, '')];
    }
  }
};

const check = function check(errors, condition, message) {
  if (!condition) {
    errors.push(message);
  }
};

const serialize_attributes = function serialize_attributes(a) {
  const oid = a.shortName ? a.shortName : a.name;
  const value = encode(forge.util.decodeUtf8(a.value));
  return `${oid}=${value}`;
};

exports.verify_certificate_chain = function verify_certificate_chain(chain) {
  return forge.pki.verifyCertificateChain(root_ca_store, chain);
};

exports.validate_client_certificate = function validate_client_certificate(chain) {
  const errors = [];
  const cert = chain[0];

  const id = cert.subject.attributes.map(serialize_attributes).join('/');
  debug(`Validating ${id}`);

  // if (period_start != null) {
  //   check(errors, cert.validity.notBefore <= period_start && period_end <= cert.validity.notAfter, "Certificate dates invalid.");
  // }
  //check(errors, exports.verify_certificate_chain(chain), "Certificate is not part of the chain");
  check(errors, cert.signatureOid === forge.pki.oids.sha256WithRSAEncryption, 'Certificate signature invalid');
  check(errors, cert.publicKey.n.bitLength() >= 2048, 'Certificate public key size is smaller than 2048');
  check(errors, cert.serialNumber != null && cert.serialNumber.trim() !== '', 'Certificate has no serial number');

  const key_usage = cert.getExtension('keyUsage');
  const digital_only = key_usage.digitalSignature && !(key_usage.keyCertSign || key_usage.cRLSign);
  check(errors, digital_only, 'Key usage is for CA and not for digital signature.');

  if (errors.length > 0) {
    throw new Error(errors);
  }
};

const retrieve_participant_registry_token = async function retrieve_participant_registry_token() {
  const now = moment();
  const iat = now.unix();
  const exp = now.add(30, 'seconds').unix();
  const payload = {
    jti: uuid.v4(),
    iss: config.pr.client_id,
    sub: config.pr.client_id,
    aud: config.pr.id,
    iat,
    exp
  };

  return await exports.create_jwt(payload);
};

exports.assert_client_using_jwt = async function assert_client_using_jwt(credentials, client_id) {
  try {
    // parse the JWT and verify it's signature
    const jwt = await exports.verifier.verify(credentials, { allowEmbeddedKey: true });
    const payload = JSON.parse(jwt.payload.toString());

    // check JWT parameters
    if (payload.iss !== client_id) {
      throw new Error(`JWT iss parameter doesn't match provided client_id parameter (${payload.iss} != ${client_id})`);
    }

    const aud = typeof payload.aud === 'string' ? [payload.aud] : payload.aud;
    if (aud == null || aud.indexOf(config.pr.client_id) === -1) {
      throw new Error('Not listed on the aud parameter');
    }
    const now = moment().unix();
    if (payload.exp < now) {
      throw new Error('Expired token');
    }

    // Validate chain certificates
    const fullchain = jwt.header.x5c.map((cert) => {
      return forge.pki.certificateFromPem('-----BEGIN CERTIFICATE-----' + cert + '-----END CERTIFICATE-----');
    });

    const serial_number_field = fullchain[0].subject.getField({ name: 'serialNumber' });
    if (serial_number_field == null) {
      // JWT iss parameter does not match the serialNumber field of the signer certificate
      throw new Error('Issuer certificate serialNumber parameter is missing');
    }

    const cert_serial_number = serial_number_field.value;
    if (payload.iss !== cert_serial_number) {
      // JWT iss parameter does not match the serialNumber field of the signer certificate
      throw new Error(
        `Issuer certificate serialNumber parameter does not match jwt iss parameter (${payload.iss} != ${cert_serial_number})`
      );
    }
    await exports.validate_client_certificate(fullchain);

    return [payload, fullchain[0]];
  } catch (e) {
    // Reponse with message
    const err = new oauth2_server.InvalidRequestError('invalid_request: invalid client credentials');
    err.details = e;
    throw err;
  }
};

const encode = function encode(value) {
  if (value.indexOf(',') !== -1) {
    const escaped_value = value.replace(/\\/g, '\\').replace(/"/g, '"');
    return `"${escaped_value}"`;
  } else {
    return value;
  }
};

exports.validate_participant_from_jwt = async function validate_participant_from_jwt(
  client_payload,
  client_certificate
) {
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
  const subject = client_certificate.subject.attributes.map(serialize_attributes).join(', ');
  parties_params.append('eori', client_payload.iss);
  parties_params.append('certificate_subject_name', subject);
  parties_params.append('active_only', 'true');

  debug('url: ' + config.pr.parties_endpoint + '?' + parties_params);
  const parties_response = await fetch(config.pr.parties_endpoint + '?' + parties_params, {
    headers: {
      Authorization: 'Bearer ' + access_token
    }
  });
  if (parties_response.status !== 200) {
    throw new oauth2_server.ServerError('internal error: unable to validate client as participant');
  } // eslint-disable-line snakecase/snakecase

  const parties_token = (await parties_response.json()).parties_token;
  const parties_jwt = await exports.verifier.verify(parties_token, { allowEmbeddedKey: true });
  const parties_info = JSON.parse(parties_jwt.payload.toString()).parties_info;
  debug('response: ', JSON.stringify(parties_info, null, 4));
  if (parties_info.count !== 1 || parties_info.data[0].adherence.status !== 'Active') {
    // Reponse with message
    throw new oauth2_server.InvalidRequestError('client is not a trusted participant');
  }

  return parties_info.data[0].party_name;
};

exports.create_jwt = async function create_jwt(payload) {
  // Prepare our private key to be able to create JWSs
  await ensure_client_key_is_ready();

  return await jose.JWS.createSign(
    {
      algorithm: 'RS256',
      format: 'compact',
      fields: {
        typ: 'JWT',
        x5c: config.pr.client_crt
      }
    },
    config.pr.client_key
  )
    .update(JSON.stringify(payload))
    .final();
};
/* eslint-enable snakecase/snakecase */

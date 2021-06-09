const config_service = require('../../lib/configService.js');
const debug = require('debug')('idm:extparticipant_utils');
const jose = require('node-jose');

const config = config_service.get_config();

const crt_regex = /^-----BEGIN CERTIFICATE-----\n([\s\S]+?)\n-----END CERTIFICATE-----$/gm;

const ensure_client_key_is_ready = async function ensure_client_key_is_ready() {
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
};

exports.create_jwt = async function create_jwt(payload) {
  // Prepare our private key to be able to create JWSs
  await ensure_client_key_is_ready();

  return await jose.JWS.createSign({
    algorithm: 'RS256',
    format: 'compact',
    fields: {
      typ: "JWT",
      x5c: config.pr.client_crt
    }
  }, config.pr.client_key).update(JSON.stringify(payload)).final();
};

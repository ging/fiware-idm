const debug = require('debug')('idm:oidc_controller');
const fs = require('fs');

const config_service = require('../../lib/configService.js');
const config = config_service.get_config();

// GET /idm/applications/:application_id/.well-known/openid-configuration -- Form get OIDC configuration application
exports.configuration = function (req, res) {
  debug('--> configuration');

  const oidc_discovery = JSON.parse(JSON.stringify(require('../../templates/oidc_discovery/oidc_discovery.json')));

  oidc_discovery.issuer = config.host + '/idm/applications/' + req.application.id;
  oidc_discovery.authorization_endpoint = config.host + '/oauth2/authorize';
  oidc_discovery.token_endpoint = config.host + '/oauth2/token';
  oidc_discovery.userinfo_endpoint = config.host + '/user';
  oidc_discovery.end_session_endpoint = config.host + '/auth/external_logout';
  oidc_discovery.revoke_endpoint = config.host + '/oauth2/revoke';
  oidc_discovery.scopes_supported = req.application.scope;
  oidc_discovery.response_types_supported = req.application.response_type;
  oidc_discovery.grant_types_supported = req.application.grant_type;
  oidc_discovery.service_documentation = 'https://fiware-idm.readthedocs.io/';
  oidc_discovery.subject_types_supported = ['public'];
  oidc_discovery.id_token_signing_alg_values_supported = ['RS256', 'HS256', 'HS384', 'HS512'];
  oidc_discovery.jwks_uri = config.host + '/idm/applications/' + req.application.id + '/certs';

  // OPTIONAL
  // oidc_discovery.registration_endpoint = ''
  // oidc_discovery.response_modes_supported =
  // oidc_discovery.acr_values_supported
  // oidc_discovery.id_token_encryption_alg_values_supported
  // oidc_discovery.id_token_encryption_enc_values_supported
  // oidc_discovery.userinfo_signing_alg_values_supported
  // oidc_discovery.userinfo_encryption_alg_values_supported
  // oidc_discovery.userinfo_encryption_enc_values_supported
  // oidc_discovery.request_object_signing_alg_values_supported
  // oidc_discovery.request_object_encryption_alg_values_supported
  // oidc_discovery.request_object_encryption_enc_values_supported
  // oidc_discovery.token_endpoint_auth_methods_supported
  // oidc_discovery.token_endpoint_auth_signing_alg_values_supported
  // oidc_discovery.display_values_supported
  // oidc_discovery.claim_types_supported
  // oidc_discovery.claims_supported
  // oidc_discovery.claims_locales_supported
  // oidc_discovery.ui_locales_supported
  // oidc_discovery.claims_parameter_supported
  // oidc_discovery.request_parameter_supported
  // oidc_discovery.request_uri_parameter_supported
  // oidc_discovery.require_request_uri_registration
  // oidc_discovery.op_policy_uri
  // oidc_discovery.op_tos_uri

  for (const c in oidc_discovery) {
    if (typeof oidc_discovery[c] === 'string' && oidc_discovery[c] === '') {
      delete oidc_discovery[c];
    }
    if (typeof oidc_discovery[c] === 'object' && oidc_discovery[c].length <= 0) {
      delete oidc_discovery[c];
    }
    if (typeof oidc_discovery[c] === 'boolean') {
      delete oidc_discovery[c];
    }
  }

  res.type('application/json');
  res.json(oidc_discovery);
};

// GET /idm/applications/:application_id/certs -- Form get OIDC configuration application
exports.certificates = function (req, res) {
  debug('--> certificates');

  const certificates = {};
  certificates.keys = [];

  const key = {};

  if (config.oidc.jwt_algorithm === 'RS256') {
    key.n = fs
      .readFileSync('./certs/applications/' + req.application.id + '-oidc-cert.pem', 'utf8')
      .replace(/(\r\n|\n|\r)/gm, '');

    // key.n = key.n.split('-----')[2]

    key.n = Buffer.from(key.n).toString('base64');

    key.kty = 'RSA';
    key.alg = 'RS256';
    key.use = 'sig';
    // key.e = 'AQAB';
    key.kid = '2021-09-29';
  }

  certificates.keys.push(key);

  res.type('application/json');
  res.json(certificates);
};

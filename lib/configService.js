const debug = require('debug')('idm:config');
const path = require('path');
const fs = require('fs');

let config = {};

const secrets_dir = process.env.SECRETS_DIR || '/run/secrets'; // eslint-disable-line snakecase/snakecase
const secrets = {};

if (fs.existsSync(secrets_dir)) {
  // eslint-disable-line snakecase/snakecase
  const files = fs.readdirSync(secrets_dir); // eslint-disable-line snakecase/snakecase
  // eslint-disable-next-line no-unused-vars
  files.forEach(function (file, index) {
    const fullPath = path.join(secrets_dir, file); // eslint-disable-line snakecase/snakecase
    const key = file;
    try {
      const data = fs.readFileSync(fullPath, 'utf8').toString().trim(); // eslint-disable-line snakecase/snakecase
      secrets[key] = data;
    } catch (e) {
      debug(e.message);
    }
  });
}

/**
 * If an ENV is a protected Docker Secret extract the value of the secret data
 */
function get_secret_data(key) {
  const filepath = process.env[key + '_FILE'];
  if (filepath) {
    process.env[key] = secrets[path.parse(filepath).base] || process.env[key];
  }
}
/*
 *  Inform the user if security is correctly enabled.
 */
function log_auth_state() {
  const stars = '***********************************************';
  if (config.session.secret === 'nodejs_idm' || config.password_encryption.key === 'nodejs_idm') {
    debug(stars);
    debug('WARNING: The current encryption keys match the defaults found in the plaintext');
    debug('         template file - please update for a production instance');
    debug(stars);
  }

  if (config.session.secret === 'nodejs_idm' || config.password_encryption === 'nodejs_idm') {
    debug(stars);
    debug('WARNING: Encryption keys must be changed if you are using the IDM in a production Environment');
    debug('        These keys should be set using Docker Secrets');
    debug(stars);
  }

  if (config.database.password === 'idm' || config.database.name === 'root') {
    debug(stars);
    debug('WARNING: It is recommended that you reconfigure the IDM database access not to use default values');
    debug('        These keys should be set using Docker Secrets');
    debug(stars);
  }
}

function to_boolean(env, default_value) {
  return env !== undefined ? env.toLowerCase() === 'true' : default_value;
}

function to_array(env, default_value) {
  return env !== undefined ? env.split(',') : default_value;
}

/**
 * Looks for environment variables that could override configuration values.
 */
function process_environment_variables(verbose) {
  const environment_variables = [
    'IDM_PORT',
    'IDM_HOST',
    'IDM_DEBUG',
    'IDM_REGISTRATION_REDIRECT ',
    'IDM_REGISTRATION_EXTENSION',
    'IDM_HEADLESS',
    // HTTPS enable
    'IDM_HTTPS_ENABLED',
    'IDM_HTTPS_PORT',
    // Config email list type to use domain filtering
    'IDM_EMAIL_LIST',
    // Secret for user sessions in web
    'IDM_SESSION_SECRET',
    'IDM_SESSION_DURATION',
    // Key to encrypt user passwords
    'IDM_ENCRYPTION_KEY',
    // Enable CORS
    'IDM_CORS_ENABLED',
    'IDM_CORS_ORIGIN',
    'IDM_CORS_METHODS',
    'IDM_CORS_ALLOWED_HEADERS',
    'IDM_CORS_EXPOSED_HEADERS',
    'IDM_CORS_CREDENTIALS',
    'IDM_CORS_MAX_AGE',
    'IDM_CORS_PREFLIGHT',
    'IDM_CORS_OPTIONS_STATUS',
    // CSP config
    'IDM_CSP_FORM_ACTION',  
    // Config oauth2 parameters
    'IDM_OAUTH_EMPTY_STATE',
    'IDM_OAUTH_AUTH_LIFETIME',
    'IDM_OAUTH_ACC_LIFETIME',
    'IDM_OAUTH_ASK_AUTH',
    'IDM_OAUTH_REFR_LIFETIME',
    'IDM_OAUTH_UNIQUE_URL',
    'IDM_OAUTH_NOT_REQUIRE_CLIENT_AUTH_GRANT_TYPE',
    // Config api parameters
    'IDM_API_LIFETIME',
    // Configure Policy Decision Point (PDP)
    //  - IdM can perform basic policy checks (HTTP verb + path)
    //  - AuthZForce can perform basic policy checks as well as advanced
    // If authorization level is advanced you can create rules, HTTP verb+resource and XACML advanced. In addition
    // you need to have an instance of authzforce deployed to perform advanced authorization request from a Pep Proxy.
    // If authorization level is basic, only HTTP verb+resource rules can be created
    'IDM_PDP_LEVEL',
    'IDM_AUTHZFORCE_ENABLED',
    'IDM_AUTHZFORCE_HOST',
    'IDM_AUTHZFORCE_PORT',
    // Enable usage control and configure where is the Policy Translation Point
    'IDM_USAGE_CONTROL_ENABLED',
    'IDM_PTP_HOST',
    'IDM_PTP_PORT',
    // Database info
    'IDM_DB_HOST',
    'IDM_DB_PASS',
    'IDM_DB_USER',
    'IDM_DB_NAME',
    'IDM_DB_DIALECT',
    'IDM_DB_PORT',
    'IDM_EX_AUTH_ENABLED',
    'IDM_EX_AUTH_ID_PREFIX',
    'IDM_EX_AUTH_PASSWORD_ENCRYPTION',
    'IDM_EX_AUTH_ID_PREFIX',
    'IDM_EX_AUTH_PASSWORD_ENCRYPTION',
    'IDM_EX_AUTH_PASSWORD_ENCRYPTION_KEY',
    'IDM_EX_AUTH_DB_HOST',
    'IDM_EX_AUTH_PORT',
    'IDM_EX_AUTH_DB_NAME',
    'IDM_EX_AUTH_DB_USER',
    'IDM_EX_AUTH_DB_PASS',
    'IDM_EX_AUTH_DB_USER_TABLE',
    'IDM_EX_AUTH_DB_DIALECT',
    // Email configuration
    'IDM_EMAIL_HOST',
    'IDM_EMAIL_PORT',
    'IDM_EMAIL_ADDRESS',
    'IDM_EMAIL_SECURE',
    'IDM_EMAIL_AUTH_ENABLE',
    'IDM_EMAIL_AUTH_TYPE',
    'IDM_EMAIL_AUTH_USER',
    'IDM_EMAIL_AUTH_PASS',
    // Authorization Registry configuration
    'IDM_AR_URL',
    'IDM_AR_TOKEN_ENDPOINT',
    'IDM_AR_DELEGATION_ENDPOINT',
    // Config themes
    'IDM_TITLE',
    'IDM_THEME',
    // Config languages
    'IDM_LANG_DEFAULT',
    // Config eIDAs Authentication
    'IDM_EIDAS_ENABLED',
    'IDM_EIDAS_GATEWAY_HOST',
    'IDM_EIDAS_NODE_HOST',
    'IDM_EIDAS_GATEWAY_HOST',
    'IDM_ENABLE_2FA',
    // Config External LDAP Authentication
    'IDM_EXTERNAL_LDAP_ENABLED',
    'IDM_EXTERNAL_LDAP_ID_PREFIX',
    'IDM_EXTERNAL_LDAP_DB_HOST',
    'IDM_EXTERNAL_LDAP_DB_PORT',
    'IDM_EXTERNAL_LDAP_DB_READER_DN',
    'IDM_EXTERNAL_LDAP_DB_READER_PASSWORD',
    'IDM_EXTERNAL_LDAP_DB_SUFFIX',
    'IDM_EXTERNAL_LDAP_DB_ID_ATTRIBUTE',
    'IDM_EXTERNAL_LDAP_DB_USERNAME_ATTRIBUTE',
    'IDM_EXTERNAL_LDAP_DB_EMAIL_ATTRIBUTE'
  ];

  const protected_variables = [
    'IDM_SESSION_SECRET',
    'IDM_ENCRYPTION_KEY',
    'IDM_DB_PASS',
    'IDM_DB_USER',
    'IDM_ADMIN_ID',
    'IDM_ADMIN_USER',
    'IDM_ADMIN_EMAIL',
    'IDM_ADMIN_PASS',
    'IDM_EX_AUTH_DB_USER',
    'IDM_EX_AUTH_DB_PASS',
    'IDM_DB_HOST',
    'IDM_PR_CLIENT_KEY',
    'IDM_PR_CLIENT_CRT',
    'IDM_EXTERNAL_LDAP_DB_READER_PASSWORD'
  ];

  // Substitute Docker Secret Variables where set.
  protected_variables.forEach((key) => {
    get_secret_data(key);
  });
  if (verbose) {
    environment_variables.forEach((key) => {
      let value = process.env[key];
      if (value) {
        if (
          key.endsWith('USER') ||
          key.endsWith('PASS') ||
          key.endsWith('PASSWORD') ||
          key.endsWith('ADMIN_ID') ||
          key.endsWith('ADMIN_EMAIL') ||
          key.endsWith('SECRET')
        ) {
          value = '********';
        }
        debug('Setting %s to environment value: %s', key, value);
      }
    });
  }

  if (process.env.IDM_PORT) {
    config.port = process.env.IDM_PORT;
  }
  if (process.env.IDM_HOST) {
    config.host = process.env.IDM_HOST;
  }
  if (process.env.IDM_DEBUG) {
    config.debug = to_boolean(process.env.IDM_DEBUG, true);
  }
  if (process.env.IDM_REGISTRATION_REDIRECT) {
    config.registration = config.registration || {};
    config.registration.redirect = process.env.IDM_REGISTRATION_REDIRECT;
    if (process.env.IDM_REGISTRATION_EXTENSION) {
      config.registration.extension = process.env.IDM_REGISTRATION_EXTENSION;
    }
  }

  if (process.env.IDM_HEADLESS) {
    config.headless = to_boolean(process.env.IDM_HEADLESS, true);
  }

  // HTTPS enable
  if (process.env.IDM_HTTPS_ENABLED) {
    config.https = config.https || {};
    config.https.enabled = to_boolean(process.env.IDM_HTTPS_ENABLED, false);
    if (process.env.IDM_HTTPS_PORT) {
      config.https.port = process.env.IDM_HTTPS_PORT;
    }
  }

  if (process.env.IDM_ENABLE_2FA) {
    config.enable_2fa = to_boolean(process.env.IDM_ENABLE_2FA, false);
  }

  // Config email list type to use domain filtering
  if (process.env.IDM_EMAIL_LIST) {
    config.email_list_type = process.env.IDM_EMAIL_LIST;
  }

  // Secret for user sessions in web
  config.session = config.session || {};
  if (process.env.IDM_SESSION_SECRET) {
    config.session.secret = process.env.IDM_SESSION_SECRET;
  }
  if (process.env.IDM_SESSION_DURATION) {
    config.session.expires = process.env.IDM_SESSION_DURATION;
  }

  // Key to encrypt user passwords
  if (process.env.IDM_ENCRYPTION_KEY) {
    config.password_encryption = config.password_encryption || {};
    config.password_encryption.key = process.env.IDM_ENCRYPTION_KEY;
  }

  // Enable CORS
  config.cors = config.cors || {};
  if (process.env.IDM_CORS_ENABLED) {
    config.cors.enabled = to_boolean(process.env.IDM_CORS_ENABLED, false);

    if (process.env.IDM_CORS_ORIGIN) {
      config.cors.origin = to_array(process.env.IDM_CORS_ORIGIN, '*');
    }
    if (process.env.IDM_CORS_METHODS) {
      config.cors.methods = to_array(process.env.IDM_CORS_METHODS, ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']);
    }

    if (process.env.IDM_CORS_ALLOWED_HEADERS) {
      config.cors.allowedHeaders = process.env.IDM_CORS_ALLOWED_HEADERS;
    }
    if (process.env.IDM_CORS_EXPOSED_HEADERS) {
      config.cors.exposedHeaders = process.env.IDM_CORS_EXPOSED_HEADERS;
    }
    if (process.env.IDM_CORS_CREDENTIALS) {
      config.cors.credentials = process.env.IDM_CORS_CREDENTIALS;
    }
    if (process.env.IDM_CORS_MAX_AGE) {
      config.cors.maxAge = process.env.IDM_CORS_MAX_AGE;
    }
    if (process.env.IDM_CORS_PREFLIGHT) {
      config.cors.preflightContinue = process.env.IDM_CORS_PREFLIGHT;
    }
    if (process.env.IDM_CORS_OPTIONS_STATUS) {
      config.cors.optionsSuccessStatus = process.env.IDM_CORS_OPTIONS_STATUS;
    }
  }

  // CSP config
  config.csp = config.csp || {};
  if (process.env.IDM_CSP_FORM_ACTION) {
      const form_action = process.env.IDM_CSP_FORM_ACTION.split(',');
      config.csp.form_action = form_action;
  }  

  // Config oauth2 parameters
  config.oauth2 = config.oauth2 || {};
  if (process.env.IDM_OAUTH_EMPTY_STATE) {
    config.oauth2.allow_empty_state = to_boolean(process.env.IDM_OAUTH_EMPTY_STATE, false);
  }
  if (process.env.IDM_OAUTH_AUTH_LIFETIME) {
    config.oauth2.authorization_code_lifetime = Number.parseInt(process.env.IDM_OAUTH_AUTH_LIFETIME);
  }
  if (process.env.IDM_OAUTH_ACC_LIFETIME) {
    config.oauth2.access_token_lifetime = Number.parseInt(process.env.IDM_OAUTH_ACC_LIFETIME);
  }
  if (process.env.IDM_OAUTH_ASK_AUTH) {
    config.oauth2.ask_authorization = process.env.IDM_OAUTH_ASK_AUTH;
  }
  if (process.env.IDM_OAUTH_REFR_LIFETIME) {
    config.oauth2.refresh_token_lifetime = Number.parseInt(process.env.IDM_OAUTH_REFR_LIFETIME);
  }
  if (process.env.IDM_OAUTH_UNIQUE_URL) {
    config.oauth2.unique_url = to_boolean(process.env.IDM_OAUTH_UNIQUE_URL, false);
  }
  if (process.env.IDM_OAUTH_NOT_REQUIRE_CLIENT_AUTH_GRANT_TYPE) {
    config.oauth2.not_require_client_authentication_grant_type = to_array(
      process.env.IDM_OAUTH_NOT_REQUIRE_CLIENT_AUTH_GRANT_TYPE,
      []
    );
  }

  // Config oidc parameters
  config.oidc = config.oidc || {};
  if (process.env.IDM_OIDC_JWT_ALGORITHM) {
    config.oidc.jwt_algorithm = process.env.IDM_OIDC_JWT_ALGORITHM;
  }

  // Config api parameters
  if (process.env.IDM_API_LIFETIME) {
    config.api = config.api || {};
    config.api.token_lifetime = Number.parseInt(process.env.IDM_API_LIFETIME);
  }

  // Configure Policy Decision Point (PDP)
  //  - IdM can perform basic policy checks (HTTP verb + path)
  //  - AuthZForce can perform basic policy checks as well as advanced
  // If authorization level is advanced you can create rules, HTTP verb+resource and XACML advanced. In addition
  // you need to have an instance of authzforce deployed to perform advanced authorization request from a Pep Proxy.
  // If authorization level is basic, only HTTP verb+resource rules can be created
  // If authorization level is payload, only HTTP verb+resource rules and payload rules can be created
  config.authorization = config.authorization || {};
  if (process.env.IDM_PDP_LEVEL) {
    config.authorization.level = process.env.IDM_PDP_LEVEL;
  }

  config.authorization.authzforce = config.authorization.authzforce || {};
  if (process.env.IDM_AUTHZFORCE_ENABLED) {
    config.authorization.authzforce.enabled = to_boolean(process.env.IDM_AUTHZFORCE_ENABLED, false);

    if (process.env.IDM_AUTHZFORCE_HOST) {
      config.authorization.authzforce.host = process.env.IDM_AUTHZFORCE_HOST;
    }
    if (process.env.IDM_AUTHZFORCE_PORT) {
      config.authorization.authzforce.port = process.env.IDM_AUTHZFORCE_PORT;
    }
  }

  // Enable usage control and configure where is the Policy Translation Point
  config.usage_control = config.usage_control || {};
  if (process.env.IDM_USAGE_CONTROL_ENABLED) {
    config.usage_control.enabled = to_boolean(process.env.IDM_USAGE_CONTROL_ENABLED, false);

    if (process.env.IDM_PTP_HOST) {
      config.usage_control.ptp.host = process.env.IDM_PTP_HOST;
    }
    if (process.env.IDM_PTP_PORT) {
      config.usage_control.ptp.port = process.env.IDM_PTP_PORT;
    }
  }

  // Database info
  config.database = config.database || {};
  if (process.env.IDM_DB_HOST) {
    config.database.host = process.env.IDM_DB_HOST;
  }
  if (process.env.IDM_DB_PASS) {
    config.database.password = process.env.IDM_DB_PASS;
  }
  if (process.env.IDM_DB_USER) {
    config.database.username = process.env.IDM_DB_USER;
  }
  if (process.env.IDM_DB_NAME) {
    config.database.database = process.env.IDM_DB_NAME;
  }
  if (process.env.IDM_DB_DIALECT) {
    config.database.dialect = process.env.IDM_DB_DIALECT;
  }
  if (process.env.IDM_DB_PORT) {
    config.database.port = process.env.IDM_DB_PORT;
  }

  config.external_auth = config.external_auth || {};
  if (process.env.IDM_EX_AUTH_ENABLED) {
    config.external_auth.enabled = to_boolean(process.env.IDM_EX_AUTH_ENABLED, false);

    if (process.env.IDM_EX_AUTH_ID_PREFIX) {
      config.external_auth.id_prefix = process.env.IDM_EX_AUTH_ID_PREFIX;
    }
    if (process.env.IDM_EX_AUTH_PASSWORD_ENCRYPTION) {
      config.external_auth.password_encryption = process.env.IDM_EX_AUTH_PASSWORD_ENCRYPTION;
    }
    if (process.env.IDM_EX_AUTH_ID_PREFIX) {
      config.external_auth.id_prefix = process.env.IDM_EX_AUTH_ID_PREFIX;
    }
    if (process.env.IDM_EX_AUTH_PASSWORD_ENCRYPTION) {
      config.external_auth.password_encryption = process.env.IDM_EX_AUTH_PASSWORD_ENCRYPTION;
    }
    if (process.env.IDM_EX_AUTH_PASSWORD_ENCRYPTION_KEY) {
      config.external_auth.password_encryption_key = process.env.IDM_EX_AUTH_PASSWORD_ENCRYPTION_KEY;
    }
    if (process.env.IDM_EX_AUTH_DB_HOST) {
      config.external_auth.database.host = process.env.IDM_EX_AUTH_DB_HOST;
    }
    if (process.env.IDM_EX_AUTH_PORT) {
      config.external_auth.database.port = process.env.IDM_EX_AUTH_PORT;
    }
    if (process.env.IDM_EX_AUTH_DB_NAME) {
      config.external_auth.database.database = process.env.IDM_EX_AUTH_DB_NAME;
    }
    if (process.env.IDM_EX_AUTH_DB_USER) {
      config.external_auth.database.username = process.env.IDM_EX_AUTH_DB_USER;
    }
    if (process.env.IDM_EX_AUTH_DB_PASS) {
      config.external_auth.database.password = process.env.IDM_EX_AUTH_DB_PASS;
    }
    if (process.env.IDM_EX_AUTH_DB_USER_TABLE) {
      config.external_auth.database.user_table = process.env.IDM_EX_AUTH_DB_USER_TABLE;
    }
    if (process.env.IDM_EX_AUTH_DIALECT) {
      config.external_auth.database.dialect = process.env.IDM_EX_AUTH_DIALECT;
    }
  }

  // Email configuration
  config.site = config.site || {};
  if (process.env.IDM_EMAIL_HOST) {
    config.mail.host = process.env.IDM_EMAIL_HOST;
  }
  if (process.env.IDM_EMAIL_PORT) {
    config.mail.port = process.env.IDM_EMAIL_PORT;
  }
  if (process.env.IDM_EMAIL_ADDRESS) {
    config.mail.from = process.env.IDM_EMAIL_ADDRESS;
  }
  if (process.env.IDM_EMAIL_SECURE) {
    config.mail.secure = to_boolean(process.env.IDM_EMAIL_SECURE, false);
  }
  if (process.env.IDM_EMAIL_AUTH_ENABLE) {
    config.mail.enable_authentication = to_boolean(process.env.IDM_EMAIL_AUTH_ENABLE, false);
  }
  if (process.env.IDM_EMAIL_AUTH_TYPE || process.env.IDM_EMAIL_AUTH_USER || process.env.IDM_EMAIL_AUTH_PASS) {
    config.mail.auth = {
      type: 'login'
    };
  }
  if (process.env.IDM_EMAIL_AUTH_TYPE) {
    config.mail.auth.type = process.env.IDM_EMAIL_AUTH_TYPE;
  }
  if (process.env.IDM_EMAIL_AUTH_USER) {
    config.mail.auth.user = process.env.IDM_EMAIL_AUTH_USER;
  }
  if (process.env.IDM_EMAIL_AUTH_PASS) {
    config.mail.auth.pass = process.env.IDM_EMAIL_AUTH_PASS;
  }

  // Delete options to not disturb smtp transport creation
  if (!config.mail.enable_authentication) {
    delete config.mail.enable_authentication;
    delete config.mail.auth;
  }

  // Participant Registry
  config.pr = config.pr || {};
  if (process.env.IDM_PR_URL) {
    config.pr.url = process.env.IDM_PR_URL;
  }
  if (process.env.IDM_PR_TOKEN_ENDPOINT) {
    config.pr.token_endpoint = process.env.IDM_PR_TOKEN_ENDPOINT;
  } else if (config.pr.url != null && config.pr.token_endpoint == null) {
    config.pr.token_endpoint = new URL('connect/token', config.pr.url).toString();
  }
  if (process.env.IDM_PR_PARTIES_ENDPOINT) {
    config.pr.parties_endpoint = process.env.IDM_PR_PARTIES_ENDPOINT;
  } else if (config.pr.url != null && config.pr.parties_endpoint == null) {
    config.pr.parties_endpoint = new URL('parties', config.pr.url).toString();
  }
  if (process.env.IDM_PR_ID) {
    config.pr.id = process.env.IDM_PR_ID;
  } else if (config.pr.id == null) {
    config.pr.id = 'EU.EORI.NL000000000';
  }
  if (process.env.IDM_PR_CLIENT_ID) {
    config.pr.client_id = process.env.IDM_PR_CLIENT_ID;
  }
  if (process.env.IDM_PR_CLIENT_KEY) {
    config.pr.client_key = process.env.IDM_PR_CLIENT_KEY;
  }
  if (process.env.IDM_PR_CLIENT_CRT) {
    config.pr.client_crt = process.env.IDM_PR_CLIENT_CRT;
  }

  // Authorization Registry configuration
  config.ar = config.ar || {};
  if (process.env.IDM_AR_URL) {
    config.ar.url = process.env.IDM_AR_URL;
  }
  if (process.env.IDM_AR_ID) {
    config.ar.identifier = process.env.IDM_AR_ID;
  } else if (config.ar.identifier == null) {
    config.ar.identifier = 'EU.EORI.NL000000004';
  }
  if (process.env.IDM_AR_TOKEN_ENDPOINT) {
    config.ar.token_endpoint = process.env.IDM_AR_TOKEN_ENDPOINT;
  } else if (config.ar.url != null && config.ar.url !== 'internal' && config.ar.token_endpoint == null) {
    config.ar.token_endpoint = new URL('connect/token', config.ar.url).toString();
  }
  if (process.env.IDM_AR_DELEGATION_ENDPOINT) {
    config.ar.delegation_endpoint = process.env.IDM_AR_DELEGATION_ENDPOINT;
  } else if (config.ar.url != null && config.ar.url !== 'internal' && config.ar.delegation_endpoint == null) {
    config.ar.delegation_endpoint = new URL('delegation', config.ar.url).toString();
  }

  // Config themes
  config.site = config.site || {};
  if (process.env.IDM_TITLE) {
    config.site.title = process.env.IDM_TITLE;
  }
  if (process.env.IDM_THEME) {
    config.site.theme = process.env.IDM_THEME;
  }

  // Config language
  if (process.env.IDM_LANG_DEFAULT) {
    config.lang.default_lang = process.env.IDM_LANG_DEFAULT;
  }

  // Config eIDAs Authentication
  config.eidas = config.eidas || {};
  if (process.env.IDM_EIDAS_ENABLED) {
    config.eidas.enabled = to_boolean(process.env.IDM_EIDAS_ENABLED, false);

    if (process.env.IDM_EIDAS_GATEWAY_HOST) {
      config.eidas.gateway_host = process.env.IDM_EIDAS_GATEWAY_HOST;
    }
    if (process.env.IDM_EIDAS_NODE_HOST) {
      config.eidas.node_host = process.env.IDM_EIDAS_NODE_HOST;
    }
    if (process.env.IDM_EIDAS_METADATA_LIFETIME) {
      config.eidas.metadata_expiration = Number.parseInt(process.env.IDM_EIDAS_METADATA_LIFETIME);
    }
  }

  config.external_auth_ldap = config.external_auth_ldap || {};
  if (process.env.IDM_EXTERNAL_LDAP_ENABLED) {
    config.external_auth_ldap.database = config.external_auth_ldap.database || {};
    config.external_auth_ldap.enabled = to_boolean(process.env.IDM_EXTERNAL_LDAP_ENABLED, false);

    if (process.env.IDM_EXTERNAL_LDAP_ID_PREFIX) {
      config.external_auth_ldap.id_prefix = process.env.IDM_EXTERNAL_LDAP_ID_PREFIX;
    }
    if (process.env.IDM_EXTERNAL_LDAP_DB_HOST) {
      config.external_auth_ldap.database.host = process.env.IDM_EXTERNAL_LDAP_DB_HOST;
    }
    if (process.env.IDM_EXTERNAL_LDAP_DB_PORT) {
      config.external_auth_ldap.database.port = process.env.IDM_EXTERNAL_LDAP_DB_PORT;
    }
    if (process.env.IDM_EXTERNAL_LDAP_DB_READER_DN) {
      config.external_auth_ldap.database.reader_dn = process.env.IDM_EXTERNAL_LDAP_DB_READER_DN;
    }
    if (process.env.IDM_EXTERNAL_LDAP_DB_READER_PASSWORD) {
      config.external_auth_ldap.database.reader_password = process.env.IDM_EXTERNAL_LDAP_DB_READER_PASSWORD;
    }
    if (process.env.IDM_EXTERNAL_LDAP_DB_SUFFIX) {
      config.external_auth_ldap.database.suffix = process.env.IDM_EXTERNAL_LDAP_DB_SUFFIX;
    }
    if (process.env.IDM_EXTERNAL_LDAP_DB_ID_ATTRIBUTE) {
      config.external_auth_ldap.database.idAttribute = process.env.IDM_EXTERNAL_LDAP_DB_ID_ATTRIBUTE;
    }
    if (process.env.IDM_EXTERNAL_LDAP_DB_USERNAME_ATTRIBUTE) {
      config.external_auth_ldap.database.usernameAttribute = process.env.IDM_EXTERNAL_LDAP_DB_USERNAME_ATTRIBUTE;
    }
    if (process.env.IDM_EXTERNAL_LDAP_DB_EMAIL_ATTRIBUTE) {
      config.external_auth_ldap.database.emailAttribute = process.env.IDM_EXTERNAL_LDAP_DB_EMAIL_ATTRIBUTE;
    }
  }
}

function set_config(new_config, verbose = false) {
  config = new_config;
  process_environment_variables(verbose);
  log_auth_state();
}

function get_config() {
  return config;
}

module.exports = {
  get_config,
  set_config
};

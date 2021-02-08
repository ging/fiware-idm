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
    // Config themes
    'IDM_TITLE',
    'IDM_THEME',
    // Config eIDAs Authentication
    'IDM_EIDAS_ENABLED',
    'IDM_EIDAS_GATEWAY_HOST',
    'IDM_EIDAS_NODE_HOST',
    'IDM_EIDAS_GATEWAY_HOST',
    'IDM_ENABLE_2FA'
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
    'IDM_DB_HOST'
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

  // Config oauth2 parameters
  config.oauth2 = config.oauth2 || {};
  if (process.env.IDM_OAUTH_EMPTY_STATE) {
    config.oauth2.allow_empty_state = to_boolean(process.env.IDM_OAUTH_EMPTY_STATE, false);
  }
  if (process.env.IDM_OAUTH_AUTH_LIFETIME) {
    config.oauth2.authorization_code_lifetime = process.env.IDM_OAUTH_AUTH_LIFETIME;
  }
  if (process.env.IDM_OAUTH_ACC_LIFETIME) {
    config.oauth2.access_token_lifetime = process.env.IDM_OAUTH_ACC_LIFETIME;
  }
  if (process.env.IDM_OAUTH_ASK_AUTH) {
    config.oauth2.ask_authorization = process.env.IDM_OAUTH_ASK_AUTH;
  }
  if (process.env.IDM_OAUTH_REFR_LIFETIME) {
    config.oauth2.refresh_token_lifetime = process.env.IDM_OAUTH_REFR_LIFETIME;
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

  // Config api parameters
  if (process.env.IDM_API_LIFETIME) {
    config.api = config.api || {};
    config.api.token_lifetime = process.env.IDM_API_LIFETIME;
  }

  // Configure Policy Decision Point (PDP)
  //  - IdM can perform basic policy checks (HTTP verb + path)
  //  - AuthZForce can perform basic policy checks as well as advanced
  // If authorization level is advanced you can create rules, HTTP verb+resource and XACML advanced. In addition
  // you need to have an instance of authzforce deployed to perform advanced authorization request from a Pep Proxy.
  // If authorization level is basic, only HTTP verb+resource rules can be created
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

  // Config themes
  config.site = config.site || {};
  if (process.env.IDM_TITLE) {
    config.site.title = process.env.IDM_TITLE;
  }
  if (process.env.IDM_THEME) {
    config.site.theme = process.env.IDM_THEME;
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
      config.eidas.metadata_expiration = process.env.IDM_EIDAS_METADATA_LIFETIME;
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

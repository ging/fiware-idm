const config = {};

config.port = 3000;
config.host = 'http://localhost:3000';

config.debug = false;

// HTTPS enable
config.https = {
  enabled: false,
  cert_file: 'certs/idm-2018-cert.pem',
  key_file: 'certs/idm-2018-key.pem',
  ca_certs: [],
  port: 443
};

// Config email list type to use domain filtering
config.email_list_type = null; // whitelist or blacklist

// Secret for user sessions in web
config.session = {
  secret: require('crypto').randomBytes(20).toString('hex'), // Must be changed
  expires: 60 * 60 * 1000 // 1 hour
};

// Key to encrypt user passwords
config.password_encryption = {
  key: 'nodejs_idm' // Must be changed
};

// Config oauth2 parameters
config.oauth2 = {
  authorization_code_lifetime: 5 * 60, // Five minutes
  access_token_lifetime: 60 * 60, // One hour
  ask_authorization: true, // Prompt a message to users to allow the application to read their details
  refresh_token_lifetime: 60 * 60 * 24 * 14, // Two weeks
  unique_url: false // This parameter allows to verify that an application with the same url
  // does not exist when creating or editing it. If there are already applications
  // with the same URL, they should be changed manually
};

// Config api parameters
config.api = {
  token_lifetime: 60 * 60 // One hour
};

// Configure Policy Decision Point (PDP)
//  - IdM can perform basic policy checks (HTTP verb + path)
//  - AuthZForce can perform basic policy checks as well as advanced
// If authorization level is advanced you can create rules, HTTP verb+resource and XACML advanced. In addition
// you need to have an instance of authzforce deployed to perform advanced authorization request from a Pep Proxy.
// If authorization level is basic, only HTTP verb+resource rules can be created
config.authorization = {
  level: 'basic', // basic|advanced
  authzforce: {
    enabled: false,
    host: 'localhost',
    port: 8080
  }
};

// Database info
config.database = {
  host: 'localhost',
  password: 'test',
  username: 'root',
  database: 'idm_test',
  dialect: 'mysql',
  port: undefined
};
// External user authentication
config.external_auth = {
  enabled: false,
  id_prefix: 'external_',
  password_encryption: 'sha1', // bcrypt and sha1 supported
  password_encryption_key: undefined,
  database: {
    host: 'localhost',
    port: undefined,
    database: 'db_name',
    username: 'db_user',
    password: 'db_pass',
    user_table: 'user_view',
    dialect: 'mysql'
  }
};

// Email configuration
config.mail = {
  host: 'localhost',
  port: 25,
  from: 'noreply@localhost'
};

// Config themes
config.site = {
  title: 'Identity Manager',
  theme: 'default'
};

// Config eIDAS Authentication
config.eidas = {
  enabled: false,
  gateway_host: 'localhost',
  node_host: 'https://se-eidas.redsara.es/EidasNode/ServiceProvider',
  metadata_expiration: 60 * 60 * 24 * 365 // One year
};

module.exports = config;

const path = require('path');
const database = require('../config').database;
const external_auth = require('../config').external_auth;
const external_auth_ldap = require('../config').external_auth_ldap;
const logs = require('../config.js').debug;
const debug = require('debug')('idm:models');

// Load ORM Model
const Sequelize = require('sequelize');

// Use BBDD Mysql
const sequelize = new Sequelize(database.database, database.username, database.password, {
  host: database.host,
  dialect: database.dialect,
  logging: logs,
  port: database.port !== 'default' ? database.port : undefined
});

sequelize
  .authenticate()
  .then(() => {
    debug('Connection has been established successfully');
  })
  .catch((err) => {
    debug('Unable to connect to the database: ', err);
  });

let user_ext;
let ext_sequelize;

if (external_auth.enabled && external_auth_ldap.enabled) {
  throw 'Just a single external auth driver can be used';
}

if (external_auth.enabled) {
  ext_sequelize = new Sequelize(
    external_auth.database.database,
    external_auth.database.username,
    external_auth.database.password,
    {
      host: external_auth.database.host,
      dialect: external_auth.database.dialect,
      port: external_auth.database.port !== 'default' ? external_auth.database.port : undefined
    }
  );

  ext_sequelize
    .authenticate()
    .then(() => {
      debug('Connection has been established successfully');
    })
    .catch((err) => {
      debug('Unable to connect to the database: ', err);
    });
}

// Import Oauth2 tables
const oauth_client = require(path.join(__dirname, 'oauth2/oauth_client'))(sequelize, Sequelize.DataTypes)

const oauth_authorization_code = require(path.join(__dirname, 'oauth2/oauth_authorization_code'))(sequelize, Sequelize.DataTypes);
const oauth_access_token = require(path.join(__dirname, 'oauth2/oauth_access_token'))(sequelize, Sequelize.DataTypes);
const oauth_refresh_token = require(path.join(__dirname, 'oauth2/oauth_refresh_token'))(sequelize, Sequelize.DataTypes);
const scope = require(path.join(__dirname, 'oauth2/oauth_scope'))(sequelize, Sequelize.DataTypes);

// Import Eidas Credentials
const eidas_credentials = require(path.join(__dirname, 'eidas_credentials'))(sequelize, Sequelize.DataTypes);

// Import Trusted Applications table
const trusted_application = require(path.join(__dirname, 'trusted_application'))(sequelize, Sequelize.DataTypes);

// Import user table
const user = require(path.join(__dirname, 'user'))(sequelize, Sequelize.DataTypes);

// Import user table for external auth database if enabled
if (external_auth.enabled) {
  user_ext = ext_require(path.join(__dirname, '../external_auth/external_user_model'))(sequelize, Sequelize.DataTypes);
}

// Import user registration profile table
const user_registration_profile = require(path.join(__dirname, 'user_registration_profile'))(sequelize, Sequelize.DataTypes);

// Import user authorized application table
const user_authorized_application = require(path.join(__dirname, 'user_authorized_application'))(sequelize, Sequelize.DataTypes);

// Import organization table
const organization = require(path.join(__dirname, 'organization'))(sequelize, Sequelize.DataTypes);

// Import role table
const role = require(path.join(__dirname, 'role'))(sequelize, Sequelize.DataTypes);

// Import permission table
const permission = require(path.join(__dirname, 'permission'))(sequelize, Sequelize.DataTypes);

// Import a table which will contains the ids of users, roles and oauth clients
const role_assignment = require(path.join(__dirname, 'role_assignment'))(sequelize, Sequelize.DataTypes);

// Import a table which will contains the ids of roles and permissions
const role_permission = require(path.join(__dirname, 'role_permission'))(sequelize, Sequelize.DataTypes);

// Import a table which will contains the ids of users and organizations and the role of the user in the organization
const user_organization = require(path.join(__dirname, 'user_organization'))(sequelize, Sequelize.DataTypes);

// Import sensor table
const iot = require(path.join(__dirname, 'iot'))(sequelize, Sequelize.DataTypes);

// Import pep proxy table
const pep_proxy = require(path.join(__dirname, 'pep_proxy'))(sequelize, Sequelize.DataTypes);

// Import authzforce table
const authzforce = require(path.join(__dirname, 'authzforce'))(sequelize, Sequelize.DataTypes);

// Import auth token table
const auth_token = require(path.join(__dirname, 'auth_token'))(sequelize, Sequelize.DataTypes);

// Import usage policies table
const usage_policy = require(path.join(__dirname, 'usage_policy'))(sequelize, Sequelize.DataTypes);

// Import role usage policies relationshìp table
const role_usage_policy = require(path.join(__dirname, 'role_usage_policy'))(sequelize, Sequelize.DataTypes);

// Import ptp table
const ptp = require(path.join(__dirname, 'ptp'))(sequelize, Sequelize.DataTypes);

// Import delegation evidence table
const delegation_evidence = require(path.join(__dirname, 'delegation_evidence'))(sequelize, Sequelize.DataTypes);

// Relation between oauth_client and trusted applications
trusted_application.belongsTo(oauth_client, { onDelete: 'cascade' });
trusted_application.belongsTo(oauth_client, {
  foreignKey: 'trusted_oauth_client_id',
  onDelete: 'cascade'
});

// Relation between users and their parameters to create or change an account
user_registration_profile.belongsTo(user, {
  foreignKey: 'user_email',
  targetKey: 'email',
  onDelete: 'cascade',
  onUpdate: 'cascade'
});

// Relation between users and auth tokens
auth_token.belongsTo(user, { onDelete: 'cascade' });
auth_token.belongsTo(pep_proxy, { onDelete: 'cascade' });

// Relation between OAuthClient and access token
oauth_access_token.belongsTo(oauth_client, { onDelete: 'cascade' });
oauth_access_token.belongsTo(user, { onDelete: 'cascade' });
oauth_access_token.belongsTo(iot, { onDelete: 'cascade' });
oauth_access_token.belongsTo(oauth_refresh_token, {
  foreignKey: 'refresh_token',
  targetKey: 'refresh_token',
  onDelete: 'cascade'
});
oauth_access_token.belongsTo(oauth_authorization_code, {
  foreignKey: 'authorization_code',
  targetKey: 'authorization_code',
  onDelete: 'cascade'
});

// Relation between OAuthClient and authorization codes
oauth_authorization_code.belongsTo(oauth_client, { onDelete: 'cascade' });
oauth_authorization_code.belongsTo(user, { onDelete: 'cascade' });

// Relation between OAuthClient and refresh_token
oauth_refresh_token.belongsTo(oauth_client, { onDelete: 'cascade' });
oauth_refresh_token.belongsTo(user, { onDelete: 'cascade' });
oauth_refresh_token.belongsTo(iot, { onDelete: 'cascade' });
oauth_refresh_token.belongsTo(oauth_authorization_code, {
  foreignKey: 'authorization_code',
  targetKey: 'authorization_code',
  onDelete: 'cascade'
});

// Relation between roles and OAuthClients
role.belongsTo(oauth_client, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});

// Relation between permissions and OAuthClients
permission.belongsTo(oauth_client, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});

// Relation between sensors and OAuthClients
iot.belongsTo(oauth_client, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});

// Relation between pep proxies and OAuthClients
pep_proxy.belongsTo(oauth_client, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});

// Relation between pep proxies and OAuthClients
authzforce.belongsTo(oauth_client, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});

// Relation between roles, users and OAuthClients
role_assignment.belongsTo(role, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});
role_assignment.belongsTo(user, {
  foreignKey: { allowNull: true },
  onDelete: 'cascade'
});
role_assignment.belongsTo(oauth_client, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});
role_assignment.belongsTo(organization, {
  foreignKey: { allowNull: true },
  onDelete: 'cascade'
});

// Relation between roles and permissions
role_permission.belongsTo(role, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});
role_permission.belongsTo(permission, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});

// Relation between users and organizations
user_organization.belongsTo(user, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});
user_organization.belongsTo(organization, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});

// Relation between user that has authorized an application and the application itself
user_authorized_application.belongsTo(user, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});
user_authorized_application.belongsTo(oauth_client, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});

// Relation between eidas credentials and oauth client
eidas_credentials.belongsTo(oauth_client, {
  foreignKey: { allowNull: false, unique: true },
  onDelete: 'cascade'
});

// Relation between eidas credentials and oauth client
usage_policy.belongsTo(oauth_client, {
  foreignKey: { allowNull: false, unique: true },
  onDelete: 'cascade'
});

// Relation between eidas credentials and oauth client
role_usage_policy.belongsTo(role, {
  foreignKey: { allowNull: false, unique: true },
  onDelete: 'cascade'
});

// Relation between eidas credentials and oauth client
role_usage_policy.belongsTo(usage_policy, {
  as: 'usage_policy',
  foreignKey: { allowNull: false, unique: true },
  onDelete: 'cascade'
});

// Relation between eidas credentials and oauth client
ptp.belongsTo(oauth_client, {
  foreignKey: { allowNull: false, unique: true },
  onDelete: 'cascade'
});

// Export tables
exports.user = user;
if (external_auth.enabled) {
  exports.user_ext = user_ext;
}
exports.user_registration_profile = user_registration_profile;
exports.organization = organization;
exports.user_organization = user_organization;
exports.role = role;
exports.permission = permission;
exports.iot = iot;
exports.pep_proxy = pep_proxy;
exports.authzforce = authzforce;
exports.role_assignment = role_assignment;
exports.role_permission = role_permission;
exports.oauth_client = oauth_client;
exports.oauth_authorization_code = oauth_authorization_code;
exports.oauth_access_token = oauth_access_token;
exports.oauth_refresh_token = oauth_refresh_token;
exports.scope = scope;
exports.auth_token = auth_token;
exports.user_authorized_application = user_authorized_application;
exports.eidas_credentials = eidas_credentials;
exports.trusted_application = trusted_application;
exports.usage_policy = usage_policy;
exports.role_usage_policy = role_usage_policy;
exports.ptp = ptp;
exports.delegation_evidence = delegation_evidence;

// Export helpers
const search_identity = require('./helpers/search_identity');
const search_distinct = require('./helpers/search_distinct');
const sequelize_functions = require('./helpers/sequelize_functions');

exports.helpers = {
  search_pep_or_user: search_identity.search_pep_or_user,
  search_iot_or_user: search_identity.search_iot_or_user,
  search_distinct,
  sequelize_functions
};

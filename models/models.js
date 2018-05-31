var path = require('path');
var database = require('../config').database;
var external_auth = require('../config').external_auth

// Load ORM Model
var Sequelize = require('sequelize');

// Use BBDD Mysql
var sequelize = new Sequelize(database.database, database.username, database.password, 
  { 
    host: database.host,
    dialect: database.dialect,
    port: (database.port !== 'default') ? database.port : undefined
  }      
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established seccessfully");
  })
  .catch(err => {
    console.log("Unable to connect to the database: ", err);
  })

if (external_auth.enabled) {
  var ext_sequelize = new Sequelize(
    external_auth.database.database,
    external_auth.database.username, 
    external_auth.database.password, 
    { 
      host: external_auth.database.host,
      dialect: external_auth.database.dialect,
      port: (external_auth.database.port !== 'default') ? external_auth.database.port : undefined
    }      
  );

  ext_sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established seccessfully");
    })
    .catch(err => {
      console.log("Unable to connect to the database: ", err);
    })
};

// Import Oauth2 tables
var oauth_client = sequelize.import(path.join(__dirname,'oauth2/oauth_client'));
var oauth_authorization_code = sequelize.import(path.join(__dirname,'oauth2/oauth_authorization_code'));
var oauth_access_token = sequelize.import(path.join(__dirname,'oauth2/oauth_access_token'));
var oauth_refresh_token = sequelize.import(path.join(__dirname,'oauth2/oauth_refresh_token'));
var scope = sequelize.import(path.join(__dirname,'oauth2/oauth_scope'));

// Import user table
var user = external_auth.enabled ? 
  ext_sequelize.import(path.join(__dirname, external_auth.database.user_table)) : sequelize.import(path.join(__dirname, 'user'));

// Import user registration profile table
var user_registration_profile = sequelize.import(path.join(__dirname,'user_registration_profile'));

// Import user authorized application table
var user_authorized_application = sequelize.import(path.join(__dirname,'user_authorized_application'));

// Import organization table
var organization = sequelize.import(path.join(__dirname,'organization'));

// Import role table
var role = sequelize.import(path.join(__dirname,'role'));

// Import permission table
var permission = sequelize.import(path.join(__dirname,'permission'));

// Import a table which will contains the ids of users, roles and oauth clients
var role_assignment = sequelize.import(path.join(__dirname,'role_assignment'));

// Import a table which will contains the ids of roles and permissions
var role_permission = sequelize.import(path.join(__dirname,'role_permission'));

// Import a table which will contains the ids of users and organizations and the role of the user in the organization
var user_organization = sequelize.import(path.join(__dirname,'user_organization'));

// Import sensor table
var iot = sequelize.import(path.join(__dirname,'iot'));

// Import pep proxy table
var pep_proxy = sequelize.import(path.join(__dirname,'pep_proxy'));

// Import authzforce table
var authzforce = sequelize.import(path.join(__dirname,'authzforce'));

// Import auth token table
var auth_token = sequelize.import(path.join(__dirname,'auth_token'));

// Relation between users and their parameters to create or change an account
user_registration_profile.belongsTo(user, {foreignKey: 'user_email', targetKey: 'email', onDelete: 'cascade', onUpdate: 'cascade'})

// Relation between users and auth tokens
auth_token.belongsTo(user, {onDelete: 'cascade'});
auth_token.belongsTo(pep_proxy, {onDelete: 'cascade'});

// Relation between OAuthClient and access token
oauth_access_token.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_access_token.belongsTo(user, {onDelete: 'cascade'});
oauth_access_token.belongsTo(iot, {onDelete: 'cascade'});

// Relation between OAuthClient and authorization codes
oauth_authorization_code.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_authorization_code.belongsTo(user, {onDelete: 'cascade'});

// Relation between OAuthClient and refresh_token
oauth_refresh_token.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_refresh_token.belongsTo(user, {onDelete: 'cascade'});
oauth_refresh_token.belongsTo(iot, {onDelete: 'cascade'});

// Relation between roles and OAuthClients
role.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between permissions and OAuthClients
permission.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between sensors and OAuthClients
iot.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between pep proxies and OAuthClients
pep_proxy.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between pep proxies and OAuthClients
authzforce.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between roles, users and OAuthClients
role_assignment.belongsTo(role, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_assignment.belongsTo(user, { foreignKey: { allowNull: true }, onDelete: 'cascade'});
role_assignment.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_assignment.belongsTo(organization, { foreignKey: { allowNull: true }, onDelete: 'cascade'});

// Relation between roles and permissions
role_permission.belongsTo(role, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_permission.belongsTo(permission, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between users and organizations
user_organization.belongsTo(user, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
user_organization.belongsTo(organization, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between user that has authorized an application and the application itself
user_authorized_application.belongsTo(user, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
user_authorized_application.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});


// Export tables
exports.user = user;
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

// Export helpers
var search_identity = require('./helpers/search_identity')
var search_distinct = require('./helpers/search_distinct')

exports.helpers = {
  search_pep_or_user: search_identity.search_pep_or_user,
  search_iot_or_user: search_identity.search_iot_or_user,
  search_distinct: search_distinct
}
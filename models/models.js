var path = require('path');
var database = require('../config').database;
var external_auth = require('../config').external_auth
var Sequelize = require('sequelize');
var Umzug = require('umzug');

// Use BBDD Mysql
var sequelize = new Sequelize(database.database, database.username, database.password, { 
    host: database.host,
    dialect: database.dialect,
    port: (database.port !== 'default') ? database.port : undefined
});

var ext_sequelize = new Sequelize(external_auth.database.database, external_auth.database.username, external_auth.database.password, { 
    host: external_auth.database.host,
    dialect: external_auth.database.dialect,
    port: (external_auth.database.port !== 'default') ? external_auth.database.port : undefined
});

// Tables
var oauth_client = sequelize.import(path.join(__dirname,'oauth2/oauth_client'));
var oauth_authorization_code = sequelize.import(path.join(__dirname,'oauth2/oauth_authorization_code'));
var oauth_access_token = sequelize.import(path.join(__dirname,'oauth2/oauth_access_token'));
var oauth_refresh_token = sequelize.import(path.join(__dirname,'oauth2/oauth_refresh_token'));
var scope = sequelize.import(path.join(__dirname,'oauth2/oauth_scope'));  
var user = sequelize.import(path.join(__dirname, 'user'));
var user_registration_profile = sequelize.import(path.join(__dirname,'user_registration_profile'));
var user_authorized_application = sequelize.import(path.join(__dirname,'user_authorized_application'));
var organization = sequelize.import(path.join(__dirname,'organization'));
var role = sequelize.import(path.join(__dirname,'role'));
var permission = sequelize.import(path.join(__dirname,'permission'));
var role_assignment = sequelize.import(path.join(__dirname,'role_assignment'));
var role_permission = sequelize.import(path.join(__dirname,'role_permission'));
var user_organization = sequelize.import(path.join(__dirname,'user_organization'));
var iot = sequelize.import(path.join(__dirname,'iot'));
var pep_proxy = sequelize.import(path.join(__dirname,'pep_proxy'));
var authzforce = sequelize.import(path.join(__dirname,'authzforce'));
var auth_token = sequelize.import(path.join(__dirname,'auth_token'));
var eidas_credentials = sequelize.import(path.join(__dirname,'eidas_credentials'));
var trusted_application = sequelize.import(path.join(__dirname,'trusted_application'));

// External User Table
var user_external = (external_auth.enabled) ? ext_sequelize.import(path.join(__dirname, external_auth.database.user_table)) : null

// Helpers
var search_identity = require('./helpers/search_identity')
var search_distinct = require('./helpers/search_distinct')

// Relations
trusted_application.belongsTo(oauth_client, {onDelete: 'cascade'});
trusted_application.belongsTo(oauth_client, {foreignKey: 'trusted_oauth_client_id', onDelete: 'cascade'});
user_registration_profile.belongsTo(user, {foreignKey: 'user_email', targetKey: 'email', onDelete: 'cascade', onUpdate: 'cascade'})
auth_token.belongsTo(user, {onDelete: 'cascade'});
auth_token.belongsTo(pep_proxy, {onDelete: 'cascade'});
oauth_access_token.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_access_token.belongsTo(user, {onDelete: 'cascade'});
oauth_access_token.belongsTo(iot, {onDelete: 'cascade'});
oauth_authorization_code.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_authorization_code.belongsTo(user, {onDelete: 'cascade'});
oauth_refresh_token.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_refresh_token.belongsTo(user, {onDelete: 'cascade'});
oauth_refresh_token.belongsTo(iot, {onDelete: 'cascade'});
role.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
permission.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
iot.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
pep_proxy.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
authzforce.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_assignment.belongsTo(role, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_assignment.belongsTo(user, { foreignKey: { allowNull: true }, onDelete: 'cascade'});
role_assignment.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_assignment.belongsTo(organization, { foreignKey: { allowNull: true }, onDelete: 'cascade'});
role_permission.belongsTo(role, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_permission.belongsTo(permission, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
user_organization.belongsTo(user, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
user_organization.belongsTo(organization, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
user_authorized_application.belongsTo(user, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
user_authorized_application.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
eidas_credentials.belongsTo(oauth_client, { foreignKey: { allowNull: false, unique: true }, onDelete: 'cascade'});


sequelize.authenticate().then(() => {
    console.log("Connection has been established seccessfully");
}).catch(err => {
    console.log("Unable to connect to the database: ", err);
})

if (external_auth.enabled) {
    ext_sequelize.authenticate().then(() => {
        console.log("Connection has been established successfully with the external database");

        var umzugMigrate = new Umzug({
            storage: "sequelize",
            storageOptions: {
                sequelize: sequelize
            },
            migrations: {
                params: [
                sequelize.getQueryInterface(),
                Sequelize
                ],
                path: path.join("./migrations/optional")
            }
        });

        return umzugMigrate.up()
    }).then(function (result) { 
        console.log("Optional migration done");
    }).catch(err => {
        console.log("Unable to connect to the external database: ", err);
    })
};

exports.user = user,
exports.user_registration_profile = user_registration_profile,
exports.organization = organization,
exports.user_organization = user_organization,
exports.role = role,
exports.permission = permission,
exports.iot = iot,
exports.pep_proxy = pep_proxy,
exports.authzforce = authzforce,
exports.role_assignment = role_assignment,
exports.role_permission = role_permission,
exports.oauth_client = oauth_client,
exports.oauth_authorization_code = oauth_authorization_code,
exports.oauth_access_token = oauth_access_token,
exports.oauth_refresh_token = oauth_refresh_token,
exports.scope = scope,
exports.auth_token = auth_token,
exports.user_authorized_application = user_authorized_application,
exports.eidas_credentials = eidas_credentials,
exports.trusted_application = trusted_application,
exports.user_external = user_external,
exports.helpers = {
    search_pep_or_user: search_identity.search_pep_or_user,
    search_iot_or_user: search_identity.search_iot_or_user,
    search_distinct: search_distinct
}
var path = require('path');
var config = require('../config').database;

// Load ORM Model
var Sequelize = require('sequelize');

// Use BBDD Mysql
var sequelize = new Sequelize(config.name, config.user, config.password, 
  { 
    host: config.host,
    dialect: 'mysql'
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


// Import Oauth2 tables
var oauth_client = sequelize.import(path.join(__dirname,'oauth2/oauth_client'));
var oauth_authorization_code = sequelize.import(path.join(__dirname,'oauth2/oauth_authorization_code'));
var oauth_access_token = sequelize.import(path.join(__dirname,'oauth2/oauth_access_token'));
var oauth_refresh_token = sequelize.import(path.join(__dirname,'oauth2/oauth_refresh_token'));
var scope = sequelize.import(path.join(__dirname,'oauth2/oauth_scope'));

// Import user table
var user = sequelize.import(path.join(__dirname,'user'));

// Import organization table
var organization = sequelize.import(path.join(__dirname,'organization'));

// Import role table
var role = sequelize.import(path.join(__dirname,'role'));

// Import permission table
var permission = sequelize.import(path.join(__dirname,'permission'));

// Import a table which will contains the ids of users, roles and oauth clients
var role_user = sequelize.import(path.join(__dirname,'role_user'));

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


// Relation between OAuthClient and access token
oauth_access_token.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_access_token.belongsTo(user, {onDelete: 'cascade'});
oauth_access_token.belongsTo(iot, {onDelete: 'cascade'});
oauth_access_token.belongsTo(pep_proxy, {onDelete: 'cascade'});


// Relation between OAuthClient and authorization codes
oauth_authorization_code.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_authorization_code.belongsTo(user, {onDelete: 'cascade'});

// Relation between OAuthClient and refresh_token
oauth_refresh_token.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_refresh_token.belongsTo(user, {onDelete: 'cascade'});
oauth_refresh_token.belongsTo(iot, {onDelete: 'cascade'});
oauth_refresh_token.belongsTo(pep_proxy, {onDelete: 'cascade'});

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
role_user.belongsTo(role, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_user.belongsTo(user, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_user.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between roles and permissions
role_permission.belongsTo(role, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_permission.belongsTo(permission, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between users and organizations
user_organization.belongsTo(user, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
user_organization.belongsTo(organization, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Exportar tablas
exports.oauth_client = oauth_client; 
exports.user = user; 
exports.organization = organization;
exports.user_organization = user_organization;
exports.role = role;
exports.permission = permission;
exports.iot = iot;
exports.pep_proxy = pep_proxy;
exports.authzforce = authzforce;
exports.role_user = role_user;
exports.role_permission = role_permission;
exports.oauth_client = oauth_client;
exports.oauth_authorization_code = oauth_authorization_code;
exports.oauth_access_token = oauth_access_token;
exports.oauth_refresh_token = oauth_refresh_token;
exports.scope = scope;

// To read all users inside users_prueba.txt
var fs = require("fs");
var text = fs.readFileSync("./models/users_prueba.txt", "utf8");
var textByLine = text.split("\n")
array_users = []
array_users.push({id: 'admin', username: 'admin', email: "apozohue10@gmail.com",   password: '1234', date_password: new Date((new Date()).getTime()),enabled: 1, admin: 1})
array_users.push({id: 'pepe', username: 'pepe', email: "alejandro_alex_91@hotmail.com",   password: '1234', date_password: new Date((new Date()).getTime()), enabled: 1, admin: 1})
/*array_users.push({id: 'pepe', username: 'pepe',  email: "pepe@pepe.com",  password: '1234', date_password: new Date((new Date()).getTime()), enabled: 1})
for (var i = 0; i < textByLine.length - 1; i++) {
  email = textByLine[i]+"@test.com"
  usuario = {id: String(textByLine[i]), username: String(textByLine[i]), email: email, password: '1234', date_password: new Date((new Date()).getTime()), enabled: 1}
  array_users.push(usuario)
}*/

// sequelize.sync() initialize tabled in BD
sequelize.sync().then(function() {  

  // INITIALIZE USER TABLE
  user.count().then(function (count){
    if(count === 0) {   // tabla is initialized only if is empty
      user.bulkCreate(array_users).then(function() {
        console.log('Base de datos (tabla user) inicializada');
        // INITIALIZE OAUTH CLIENT TABLE
        oauth_client.count().then(function (count){
          if(count === 0) {   // tabla is initialized only if is empty
            oauth_client.bulkCreate( 
              [ {name: 'app1', description: 'Descrip App1', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'password', image: 'default'},
                {name: 'app2', description: 'Descrip App2', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'client_credentials', image: 'default'},
                {name: 'app3', description: 'Descrip App3', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'authorization_code', response_type: 'code', image: 'default'},
                {name: 'app4', description: 'Descrip App4', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'implicit', response_type: 'token', image: 'default'},
                {id: 'idm_admin_app', name: 'idm', description: 'idm', url: '', redirect_uri: '', grant_type: '', response_type: '', image: 'default'}
              ]
            ).then(function(){
              console.log('Base de datos (tabla OAuthClient) inicializada');
              // INITIALIZE ROLE TABLE
              role.count().then(function (count){
                if(count === 0) {   // tabla is initialized only if is empty
                  oauth_client.findAll({ where: {name: ['app1', 'app2', 'app3']}}).then(function(app) {
                    role.bulkCreate( 
                      [ {id: 'provider', is_internal: 1, name: 'Provider', oauth_client_id: 'idm_admin_app'},
                        {id: 'purchaser', is_internal: 1, name: 'Purchaser', oauth_client_id: 'idm_admin_app'},
                        {id: '85498539-e03c-49e6-a396-c9c7c5dc2bd0', name: 'PruebaRole', oauth_client_id: app[0].id},
                        {id: 'ae125136-15bd-42cc-af7f-ccb2ad5d687f', name: 'PruebaRole', oauth_client_id: app[1].id},
                        {id: 'd1591d7c-3c8f-42fe-b343-5c3f817d1d1e', name: 'PruebaRole', oauth_client_id: app[2].id}
                      ]
                    ).then(function(){
                      console.log('Base de datos (tabla Role) inicializada');
                      // INITIALIZE PERMISSION TABLE
                      permission.count().then(function (count){
                        if(count === 0) {   // tabla is initialized only if is empty
                          oauth_client.findAll({ where: {name: ['app1', 'app2', 'app3']}}).then(function(app) {
                            permission.bulkCreate( 
                              [ {id: '1', is_internal: 1, name: 'Get and assign all internal application roles',  oauth_client_id: 'idm_admin_app'},
                                {id: '2', is_internal: 1, name: 'Manage the application',                         oauth_client_id: 'idm_admin_app'},
                                {id: '3', is_internal: 1, name: 'Manage roles',                                   oauth_client_id: 'idm_admin_app'},
                                {id: '4', is_internal: 1, name: 'Manage authorizations',                          oauth_client_id: 'idm_admin_app'},
                                {id: '5', is_internal: 1, name: 'Get and assign all public application roles',    oauth_client_id: 'idm_admin_app'},
                                {id: '6', is_internal: 1, name: 'Get and assign only public owned roles',         oauth_client_id: 'idm_admin_app'},
                                {is_internal: 0, name: 'Prueba',         oauth_client_id: app[0].id},
                                {is_internal: 0, name: 'Prueba',         oauth_client_id: app[1].id},
                                {is_internal: 0, name: 'Prueba',         oauth_client_id: app[2].id}  
                              ]
                            ).then(function(){
                              console.log('Base de datos (tabla Permission) inicializada');
                              // INITIALIZE ROLE_PERMISSION TABLE
                              role_permission.count().then(function (count){
                                if(count === 0) {   // tabla is initialized only if is empty
                                  role_permission.bulkCreate(
                                    [ {role_id: 'provider',  permission_id: '1'},
                                      {role_id: 'provider',  permission_id: '2'},
                                      {role_id: 'provider',  permission_id: '3'},
                                      {role_id: 'provider',  permission_id: '4'},
                                      {role_id: 'provider',  permission_id: '5'},
                                      {role_id: 'provider',  permission_id: '6'},
                                      {role_id: 'purchaser', permission_id: '5'}
                                    ]
                                  ).then(function() {
                                    console.log('Base de datos (tabla Role_Permisison) inicializada');
                                    // INITIALIZE ROLE_USER TABLE
                                    role_user.count().then(function (count) {
                                      if(count === 0) { // tabla is initialized only if is empty
                                        oauth_client.findAll({ where: {name: ['app1', 'app2', 'app3']}}).then(function(app) { 
                                          role_user.bulkCreate(
                                            [ {role_id: 'provider', user_id: 'admin', oauth_client_id: app[2].id},
                                              {role_id: 'd1591d7c-3c8f-42fe-b343-5c3f817d1d1e', user_id: 'admin', oauth_client_id: app[2].id},
                                              {role_id: 'purchaser', user_id: 'pepe', oauth_client_id: app[2].id},                                                
                                              {role_id: 'provider', user_id: 'pepe', oauth_client_id: app[1].id},
                                              {role_id: 'purchaser', user_id: 'admin', oauth_client_id: app[1].id},
                                              {role_id: 'ae125136-15bd-42cc-af7f-ccb2ad5d687f', user_id: 'admin', oauth_client_id: app[1].id},
                                              {role_id: '85498539-e03c-49e6-a396-c9c7c5dc2bd0', user_id: 'pepe', oauth_client_id: app[0].id},
                                              {role_id: '85498539-e03c-49e6-a396-c9c7c5dc2bd0', user_id: 'admin', oauth_client_id: app[0].id},
                                              {role_id: 'provider', user_id: 'admin', oauth_client_id: app[0].id}
                                            ]
                                          ).then(function() {
                                            console.log('Base de datos (tabla Role_user) inicializada');
                                          });
                                        }); 
                                      }
                                    });
                                  });
                                }
                              });
                            });
                          });
                        }
                      });
                    });
                  });
                }
              });
            });
          }
        });
      });
    }
  });
});

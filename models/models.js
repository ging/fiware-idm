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

// Import role table
var role = sequelize.import(path.join(__dirname,'role'));

// Import permission table
var permission = sequelize.import(path.join(__dirname,'permission'));

// Import a table which will contains the ids of users, roles and oauth clients
var role_user = sequelize.import(path.join(__dirname,'role_user'));

// Import a table which will contains the ids of roles and permissions
var role_permission = sequelize.import(path.join(__dirname,'role_permission'));


// Relation between OAuthClient and access token
oauth_access_token.belongsTo(oauth_client);
oauth_access_token.belongsTo(user);

// Relation between OAuthClient and authorization codes
oauth_authorization_code.belongsTo(oauth_client);
oauth_authorization_code.belongsTo(user);

// Relation between OAuthClient and refresh_token
oauth_refresh_token.belongsTo(oauth_client);
oauth_refresh_token.belongsTo(user);

// Relation between OAuthClient and Authorization Code
oauth_authorization_code.belongsTo(oauth_client);

// Relation between roles and OAuthClients
role.belongsTo(oauth_client);

// Relation between permissions and OAuthClients
permission.belongsTo(oauth_client);

// Relation between permissions and roles
role.belongsToMany(permission, {through: 'Role_Permissions'});
permission.belongsToMany(role, {through: 'Role_Permissions'});

// Relation between roles, users and OAuthClients
role_user.belongsTo(role);
role_user.belongsTo(user);
role_user.belongsTo(oauth_client);

// Relation between roles and permissions
role_permission.belongsTo(role);
role_permission.belongsTo(permission);
role_permission.belongsTo(oauth_client);

// Exportar tablas
exports.oauth_client = oauth_client; 
exports.user = user; 
exports.role = role;
exports.permission = permission;
exports.role_user = role_user;
exports.role_permission = role_permission;
exports.oauth_client = oauth_client;
exports.oauth_authorization_code = oauth_authorization_code;
exports.oauth_access_token = oauth_access_token;
exports.oauth_refresh_token = oauth_refresh_token;
exports.scope = scope;

// sequelize.sync() initialize tabled in BD
sequelize.sync().then(function() {

  // INITIALIZE USER TABLE
  user.count().then(function (count){
    if(count === 0) {   // tabla is initialized only if is empty
      user.bulkCreate( 
        [ {id: 'admin', username: 'admin', email: "admin@admin.com",   password: '1234', enabled: 1},
          {id: 'pepe', username: 'pepe',  email: "pepe@pepe.com",     password: '5678', enabled: 1} 
        ]
      ).then(function() {
        console.log('Base de datos (tabla user) inicializada');
        // INITIALIZE OAUTH CLIENT TABLE
        oauth_client.count().then(function (count){
          if(count === 0) {   // tabla is initialized only if is empty
            oauth_client.bulkCreate( 
              [ {name: 'app1', description: 'Descrip App1', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'password'},
                {name: 'app2', description: 'Descrip App2', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'client_credentials'},
                {name: 'app3', description: 'Descrip App3', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'authorization_code', response_type: 'code'},
                {name: 'app4', description: 'Descrip App4', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'implicit', response_type: 'token'}
              ]
            ).then(function(){
              console.log('Base de datos (tabla OAuthClient) inicializada');
              // INITIALIZE ROLE TABLE
              role.count().then(function (count){
                if(count === 0) {   // tabla is initialized only if is empty
                  oauth_client.findAll({ where: {name: ['app1', 'app2', 'app3']}}).then(function(app) {
                    role.bulkCreate( 
                      [ {name: 'Provider', oauth_client_id: app[0].id},
                        {name: 'Provider', oauth_client_id: app[1].id},
                        {name: 'Provider', oauth_client_id: app[2].id},
                        {name: 'Purchaser', oauth_client_id: app[0].id},
                        {name: 'Purchaser', oauth_client_id: app[1].id},
                        {name: 'Purchaser', oauth_client_id: app[2].id}
                      ]
                    ).then(function(){
                      console.log('Base de datos (tabla Role) inicializada');
                      // INITIALIZE PERMISSION TABLE
                      permission.count().then(function (count){
                        if(count === 0) {   // tabla is initialized only if is empty
                          oauth_client.findAll({ where: {name: ['app1', 'app2', 'app3']}}).then(function(app) {
                            permission.bulkCreate( 
                              [ {name: 'Manage blabla', oauth_client_id: app[0].id},
                                {name: 'Manage blabla', oauth_client_id: app[1].id},
                                {name: 'Manage blabla', oauth_client_id: app[2].id},
                                {name: 'Authorize eso', oauth_client_id: app[0].id},
                                {name: 'Authorize eso', oauth_client_id: app[1].id},
                                {name: 'Authorize eso', oauth_client_id: app[2].id},
                                {name: 'Authenticate', oauth_client_id: app[0].id},
                                {name: 'Authenticate', oauth_client_id: app[1].id},
                                {name: 'Authenticate', oauth_client_id: app[2].id}
                              ]
                            ).then(function(){
                              console.log('Base de datos (tabla Permission) inicializada');
                              // INITIALIZE ROLE_PERMISSION TABLE
                              role_permission.count().then(function (count){
                                if(count === 0) {   // tabla is initialized only if is empty
                                  role.findAll().then(function(roles) {
                                    permission.findAll().then(function(permissions) {
                                      for(role in roles) {
                                        for (permission in permissions) {
                                          if (roles[role].oauth_client_id === permissions[permission].oauth_client_id) {
                                            role_permission.create({role_id: roles[role].id, permission_id: permissions[permission].id, oauth_client_id: roles[role].oauth_client_id}).then({})
                                          }
                                        }
                                      }
                                      console.log('Base de datos (tabla Role_Permisison) inicializada');
                                      // INITIALIZE ROLE_USER TABLE
                                      role_user.count().then(function (count) {
                                        if(count === 0) { // tabla is initialized only if is empty
                                          oauth_client.findAll({ where: {name: ['app1', 'app2', 'app3']}}).then(function(app) { 
                                            role_user.bulkCreate(
                                              [ {user_id: 'admin', oauth_client_id: app[2].id},
                                                {user_id: 'pepe', oauth_client_id: app[1].id},
                                                {user_id: 'admin', oauth_client_id: app[0].id}
                                              ]
                                            ).then(function() {
                                              console.log('Base de datos (tabla Role_user) inicializada');
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

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
oauth_access_token.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_access_token.belongsTo(user, {onDelete: 'cascade'});

// Relation between OAuthClient and authorization codes
oauth_authorization_code.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_authorization_code.belongsTo(user, {onDelete: 'cascade'});

// Relation between OAuthClient and refresh_token
oauth_refresh_token.belongsTo(oauth_client, {onDelete: 'cascade'});
oauth_refresh_token.belongsTo(user, {onDelete: 'cascade'});

// Relation between roles and OAuthClients
role.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between permissions and OAuthClients
permission.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between roles, users and OAuthClients
role_user.belongsTo(role, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_user.belongsTo(user, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_user.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

// Relation between roles and permissions
role_permission.belongsTo(role, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_permission.belongsTo(permission, { foreignKey: { allowNull: false }, onDelete: 'cascade'});
role_permission.belongsTo(oauth_client, { foreignKey: { allowNull: false }, onDelete: 'cascade'});

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

var fs = require("fs");
var text = fs.readFileSync("./models/users_prueba.txt", "utf8");
var textByLine = text.split("\n")
array_users = []
array_users.push({id: 'admin', username: 'admin', email: "admin@admin.com",   password: '1234', enabled: 1})
array_users.push({id: 'pepe', username: 'pepe',  email: "pepe@pepe.com",     password: '1234', enabled: 1})
for (var i = 0; i < textByLine.length - 1; i++) {
  email = textByLine[i]+"@test.com"
  usuario = {id: String(textByLine[i]), username: String(textByLine[i]), email: email,   password: '1234', enabled: 1}
  array_users.push(usuario)
}

// sequelize.sync() initialize tabled in BD
sequelize.sync().then(function() {  

  // INITIALIZE USER TABLE
  user.count().then(function (count){
    if(count === 0) {   // tabla is initialized only if is empty
      //user.bulkCreate( 
        // [ {id: 'admin', username: 'admin', email: "admin@admin.com",   password: '1234', enabled: 1},
        //   {id: 'pepe', username: 'pepe',  email: "pepe@pepe.com",     password: '1234', enabled: 1},
        //   {id: 'jose', username: 'jose',  email: "jose@jose.com",     password: '1234', enabled: 1},
        //   {id: 'luis', username: 'luis',  email: "luis@luis.com",     password: '1234', enabled: 1},
        //   {id: 'alex', username: 'alex',  email: "alex@alex.com",     password: '1234', enabled: 1},
        //   {id: 'alvaro', username: 'alvaro',  email: "alvaro@alvaro.com",     password: '1234', enabled: 1},
        //   {id: 'lourdes', username: 'lourdes',  email: "lourdes@lourdes.com",     password: '1234', enabled: 1},
        //   {id: 'ana', username: 'ana',  email: "ana@ana.com",     password: '1234', enabled: 1},
        //   {id: 'sonsoles', username: 'sonsoles',  email: "sonsoles@sonsoles.com",     password: '1234', enabled: 1},
        //   {id: 'abel', username: 'abel',  email: "abel@abel.com",     password: '1234', enabled: 1},
        //   {id: 'aldo', username: 'aldo',  email: "aldo@aldo.com",     password: '1234', enabled: 1},
        //   {id: 'berto', username: 'berto',  email: "berto@berto.com",     password: '1234', enabled: 1},
        //   {id: 'kike', username: 'kike',  email: "kike@kike.com",     password: '1234', enabled: 1},
        //   {id: 'damian', username: 'damian',  email: "damian@damian.com",     password: '1234', enabled: 1},
        //   {id: 'andres', username: 'andres',  email: "andres@andres.com",     password: '1234', enabled: 1},
        //   {id: 'pedro', username: 'pedro',  email: "pedro@pedro.com",     password: '1234', enabled: 1},
        //   {id: 'nacho', username: 'nacho',  email: "nacho@nacho.com",     password: '1234', enabled: 1},
        //   {id: 'roberto', username: 'roberto',  email: "roberto@roberto.com",     password: '1234', enabled: 1},
        //   {id: 'çarlos', username: 'çarlos sainz',  email: "carlos@sainz.com",     password: '1234', enabled: 1},
        //   {id: 'señor', username: 'señor dell',  email: "señor@dell.com",     password: '1234', enabled: 1},
        //   {id: 'maría', username: 'maría lópez',  email: "maria@lopez.com",     password: '1234', enabled: 1}    
        // ]
      user.bulkCreate(array_users).then(function() {
        console.log('Base de datos (tabla user) inicializada');
        // INITIALIZE OAUTH CLIENT TABLE
        oauth_client.count().then(function (count){
          if(count === 0) {   // tabla is initialized only if is empty
            oauth_client.bulkCreate( 
              [ {name: 'app1', description: 'Descrip App1', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'password', image: 'default'},
                {name: 'app2', description: 'Descrip App2', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'client_credentials', image: 'default'},
                {name: 'app3', description: 'Descrip App3', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'authorization_code', response_type: 'code', image: 'default'},
                {name: 'app4', description: 'Descrip App4', url: 'http://prueba.com', redirect_uri: 'http://localhost/login', grant_type: 'implicit', response_type: 'token', image: 'default'}
              ]
            ).then(function(){
              console.log('Base de datos (tabla OAuthClient) inicializada');
              // INITIALIZE ROLE TABLE
              role.count().then(function (count){
                if(count === 0) {   // tabla is initialized only if is empty
                  oauth_client.findAll({ where: {name: ['app1', 'app2', 'app3']}}).then(function(app) {
                    role.bulkCreate( 
                      [ {id: '44ebbcab-853c-44bd-899a-238b816f643e', name: 'Provider', oauth_client_id: app[0].id},
                        {id: 'a0be9ffe-4e01-492b-990b-97a96bb35103', name: 'Provider', oauth_client_id: app[1].id},
                        {id: 'f097941e-7901-4ea5-a601-fed7ab496875', name: 'Provider', oauth_client_id: app[2].id},
                        {id: '1367913a-1784-4229-8466-2aaab6bf8f33', name: 'Purchaser', oauth_client_id: app[0].id},
                        {id: 'd5e8fa8e-53fc-4242-8bba-7a290d1a9522', name: 'Purchaser', oauth_client_id: app[1].id},
                        {id: 'dcb3a243-c2be-4105-acb4-656bb16565ff', name: 'Purchaser', oauth_client_id: app[2].id},
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
                              [ {name: 'Get and assign all internal application roles', oauth_client_id: app[0].id},
                                {name: 'Get and assign all internal application roles', oauth_client_id: app[1].id},
                                {name: 'Get and assign all internal application roles', oauth_client_id: app[2].id},
                                {name: 'Manage the application', oauth_client_id: app[0].id},
                                {name: 'Manage the application', oauth_client_id: app[1].id},
                                {name: 'Manage the application', oauth_client_id: app[2].id},
                                {name: 'Manage roles', oauth_client_id: app[0].id},
                                {name: 'Manage roles', oauth_client_id: app[1].id},
                                {name: 'Manage roles', oauth_client_id: app[2].id},
                                {name: 'Manage authorizations', oauth_client_id: app[0].id},
                                {name: 'Manage authorizations', oauth_client_id: app[1].id},
                                {name: 'Manage authorizations', oauth_client_id: app[2].id},
                                {name: 'Get and assign all public application roles', oauth_client_id: app[0].id},
                                {name: 'Get and assign all public application roles', oauth_client_id: app[1].id},
                                {name: 'Get and assign all public application roles', oauth_client_id: app[2].id},
                                {name: 'Get and assign only public owned roles', oauth_client_id: app[0].id},
                                {name: 'Get and assign only public owned roles', oauth_client_id: app[1].id},
                                {name: 'Get and assign only public owned roles', oauth_client_id: app[2].id}
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
                                            if (roles[role].name === 'Purchaser' && permissions[permission].name === 'Get and assign all public application roles') {
                                              role_permission.create({role_id: roles[role].id, permission_id: permissions[permission].id, oauth_client_id: roles[role].oauth_client_id}).then({})
                                            } else if (roles[role].name === 'Provider') {
                                              role_permission.create({role_id: roles[role].id, permission_id: permissions[permission].id, oauth_client_id: roles[role].oauth_client_id}).then({})
                                            }
                                          }
                                        }
                                      }
                                      console.log('Base de datos (tabla Role_Permisison) inicializada');
                                      // INITIALIZE ROLE_USER TABLE
                                      role_user.count().then(function (count) {
                                        if(count === 0) { // tabla is initialized only if is empty
                                          oauth_client.findAll({ where: {name: ['app1', 'app2', 'app3']}}).then(function(app) { 
                                            role_user.bulkCreate(
                                              [ {role_id: 'dcb3a243-c2be-4105-acb4-656bb16565ff', user_id: 'admin', oauth_client_id: app[2].id},
                                                {role_id: 'f097941e-7901-4ea5-a601-fed7ab496875', user_id: 'admin', oauth_client_id: app[2].id},
                                                {role_id: 'dcb3a243-c2be-4105-acb4-656bb16565ff', user_id: 'pepe', oauth_client_id: app[2].id},
                                                {role_id: '44ebbcab-853c-44bd-899a-238b816f643e', user_id: 'pepe', oauth_client_id: app[0].id},
                                                {role_id: 'ae125136-15bd-42cc-af7f-ccb2ad5d687f', user_id: 'pepe', oauth_client_id: app[1].id},
                                                {role_id: 'ae125136-15bd-42cc-af7f-ccb2ad5d687f', user_id: 'admin', oauth_client_id: app[1].id},
                                                {role_id: 'd5e8fa8e-53fc-4242-8bba-7a290d1a9522', user_id: 'admin', oauth_client_id: app[1].id},
                                                {role_id: '44ebbcab-853c-44bd-899a-238b816f643e', user_id: 'admin', oauth_client_id: app[0].id},
                                                {role_id: '1367913a-1784-4229-8466-2aaab6bf8f33', user_id: 'admin', oauth_client_id: app[0].id}
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

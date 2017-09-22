var path = require('path');
var config = require('../config').database;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD Mysql
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


// Importar definicion de la tablas de Oauth2
var oauth_client = sequelize.import(path.join(__dirname,'oauth2/oauth_client'));
var oauth_authorization_code = sequelize.import(path.join(__dirname,'oauth2/oauth_authorization_code'));
var oauth_access_token = sequelize.import(path.join(__dirname,'oauth2/oauth_access_token'));
var oauth_refresh_token = sequelize.import(path.join(__dirname,'oauth2/oauth_refresh_token'));
var scope = sequelize.import(path.join(__dirname,'oauth2/oauth_scope'));

// Importar definicion de la tabla user
var user = sequelize.import(path.join(__dirname,'user'));

// Importar definicion de la tabla role
var role = sequelize.import(path.join(__dirname,'role'));

// Importar definicion de la tabla permission
var permission = sequelize.import(path.join(__dirname,'permission'));

// Importar definicion de la tabla permission
var role_user = sequelize.import(path.join(__dirname,'role_user'));


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

// Los usuarios pueden registrar aplicaciones
// OAuthClient.belongsTo(user);
// user.hasMany(OAuthClient);

// Exportar tablas
exports.oauth_client = oauth_client; 
exports.user = user; 
exports.role = role;
exports.permission = permission;
exports.role_user = role_user;
exports.oauth_client = oauth_client;
exports.oauth_authorization_code = oauth_authorization_code;
exports.oauth_access_token = oauth_access_token;
exports.oauth_refresh_token = oauth_refresh_token;
exports.scope = scope;

// sequelize.sync() inicializa las tablas en la DB
sequelize.sync().then(function() {
  // then(..) ejecuta el manejador una vez creada la tabla
  user.count().then(function (count){
    if(count === 0) {   // la tabla se inicializa solo si está vacía
      user.bulkCreate( 
        [ {id: 'admin', username: 'admin', email: "admin@admin.com",   password: '1234', enabled: 1},
          {id: 'pepe', username: 'pepe',  email: "pepe@pepe.com",     password: '5678', enabled: 1} 
        ]
      ).then(function() {
        console.log('Base de datos (tabla user) inicializada');
        oauth_client.count().then(function (count){
          if(count === 0) {   // la tabla se inicializa solo si está vacía
            oauth_client.bulkCreate( 
              [ {name: 'app1', description: 'Descrip App1', url: 'http://prueba.com', redirect_uri: 'http://prueba.com/login', grant_type: 'password'},
                {name: 'app2', description: 'Descrip App2', url: 'http://prueba.com', redirect_uri: 'http://prueba.com/login', grant_type: 'client_credentials'},
                {name: 'app3', description: 'Descrip App3', url: 'http://prueba.com', redirect_uri: 'http://prueba.com/login', grant_type: 'authorization_code', response_type: 'code'},
                {name: 'app4', description: 'Descrip App4', url: 'http://prueba.com', redirect_uri: 'http://prueba.com/login', grant_type: 'implicit', response_type: 'token'}
              ]
            ).then(function(){
              console.log('Base de datos (tabla OAuthClient) inicializada');
              role_user.count().then(function (count) {
                if(count === 0) {
                  oauth_client.findAll({ where: {name: ['app1', 'app2', 'app3']}}).then(function(app) { 
                    role_user.bulkCreate(
                      [ {user_id: 'admin', oauth_client_id: app[2].id},
                        {user_id: 'pepe', oauth_client_id: app[1].id},
                        {user_id: 'admin', oauth_client_id: app[0].id}
                      ]
                    ).then(function() {
                      console.log('Base de datos (tabla Role_user) inicializada')
                    });
                  }); 
                }
              });
            });
          };
        });
      });
    };
  });
});
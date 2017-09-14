var path = require('path');

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD Mysql
var sequelize = new Sequelize('idm', 'root', 'idm', 
  { 
    host: 'localhost',
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


// Importar definicion de la tabla Applications
var Application = sequelize.import(path.join(__dirname,'application'));

// Importar definicion de la tabla user
var User = sequelize.import(path.join(__dirname,'user'));

// Importar definicion de la tabla role
var Role = sequelize.import(path.join(__dirname,'role'));

// Importar definicion de la tabla permission
var Permission = sequelize.import(path.join(__dirname,'permission'));

// Importar definicion de la tabla permission
var Role_User = sequelize.import(path.join(__dirname,'role_user'));


// Relation between roles and applications
Role.belongsTo(Application);

// Relation between permissions and applications
Permission.belongsTo(Application);

// Relation between permissions and roles
Role.belongsToMany(Permission, {through: 'Role_Permissions'});
Permission.belongsToMany(Role, {through: 'Role_Permissions'});

// Relation between roles, users and applications
Role_User.belongsTo(Role);
Role_User.belongsTo(User);
Role_User.belongsTo(Application);

// Los usuarios pueden registrar aplicaciones
// Application.belongsTo(User);
// User.hasMany(Application);

// Exportar tablas
exports.Application = Application; 
exports.User = User; 
exports.Role = Role;
exports.Permission = Permission;

// sequelize.sync() inicializa las tablas en la DB
sequelize.sync().then(function() {
  // then(..) ejecuta el manejador una vez creada la tabla
  User.count().then(function (count){
    if(count === 0) {   // la tabla se inicializa solo si está vacía
      User.bulkCreate( 
        [ {username: 'admin', email: "admin@admin.com",   password: '1234', enabled: 1},
          {username: 'pepe',  email: "pepe@pepe.com",     password: '5678', enabled: 1} 
        ]
      ).then(function(){
        console.log('Base de datos (tabla user) inicializada');
        Application.count().then(function (count){
          if(count === 0) {   // la tabla se inicializa solo si está vacía
            Application.bulkCreate( 
              [ {name: 'app1', description: 'Descrip App1', url: 'http://prueba.com', callbackurl: 'http://prueba.com/login'},
                {name: 'app2', description: 'Descrip App2', url: 'http://prueba.com', callbackurl: 'http://prueba.com/login'},
                {name: 'app3', description: 'Descrip App3', url: 'http://prueba.com', callbackurl: 'http://prueba.com/login'}
              ]
            ).then(function(){console.log('Base de datos (tabla Application) inicializada')});
          };
        });
      });
    };
  });
});
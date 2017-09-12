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

// Los usuarios pueden registrar aplicaciones
// Application.belongsTo(User);
// User.hasMany(Application);

// Exportar tablas
exports.Application = Application; 
exports.User = User; 

// sequelize.sync() inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
  // then(..) ejecuta el manejador una vez creada la tabla
  User.count().then(function (count){
    if(count === 0) {   // la tabla se inicializa solo si está vacía
      User.bulkCreate( 
        [ {username: 'admin', email: "admin@admin.com",   password: '1234'},
          {username: 'pepe',  email: "pepe@pepe.com",     password: '5678'} 
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
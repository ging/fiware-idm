var path = require('path');

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD Mysql
var sequelize = new Sequelize('idm', 'root', 'root', 
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


// Importar definicion de la tabla idm
var Application = sequelize.import(path.join(__dirname,'applications'));


// exportar tablas
exports.Application = Application; 

// sequelize.sync() inicializa las tablas
sequelize.sync().then(function() {
  // then(..) ejecuta el manejador una vez creada la tabla
    console.log('Base de datos (tabla user) inicializada');
    Application.count().then(function (count){
      if(count === 0) {   // la tabla se inicializa solo si está vacía
        Application.bulkCreate( 
          [ {Name: 'app1', Description: 'Descrip App1', ApplicationId: '112312', ApplicationSecret: '121233'},
            {Name: 'app2', Description: 'Descrip App2', ApplicationId: '224433', ApplicationSecret: '223435'},
            {Name: 'app3', Description: 'Descrip App3', ApplicationId: '334433', ApplicationSecret: '333435'}
          ]
        ).then(function(){console.log('Base de datos (tabla application) inicializada')});
      };
    });
});
var config = require('../../config.js').database


// Load ORM Model
var Sequelize = require('sequelize');

// Use BBDD Mysql
var sequelize = new Sequelize(config.database, config.username, config.password, 
  { 
    host: config.host,
    dialect: config.dialect
  }      
);


// Helper to find info about pep proxy or user 
module.exports = function(id) {
    var query = `SELECT email, 'user' as Source FROM user WHERE email=:id
                 UNION ALL
                 SELECT id, 'pep_proxy' as Source FROM pep_proxy WHERE id=:id;`

    return sequelize.query(query, {replacements: {id: id}, type: Sequelize.QueryTypes.SELECT})
}
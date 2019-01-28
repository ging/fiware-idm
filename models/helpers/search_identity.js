var config = require('../../config.js').database


// Load ORM Model
var Sequelize = require('sequelize');

// Use BBDD Mysql
var sequelize = new Sequelize(config.database, config.username, config.password,
  {
    host: config.host,
    dialect: config.dialect,
    define: config.define,
    port: (config.port !== 'default') ? config.port : undefined
  }
);


// Helper to find info about pep proxy or user
exports.search_pep_or_user = function(id) {
    var query = "SELECT email, 'user' as Source FROM \"user\" WHERE email=:id"
                 + " UNION ALL "
                 + "SELECT id, 'pep_proxy' as Source FROM pep_proxy WHERE id=:id;"

    if (sequelize.getDialect() === 'mysql') {
         query = query.replace('"','`')
    }
    console.log('search_pep_or_user >>>>>>>>>>>>>>>>>>>>query:\n', query)

    return sequelize.query(query, {replacements: {id: id}, type: Sequelize.QueryTypes.SELECT})
}

// Helper to find info about iot or user
exports.search_iot_or_user = function(id) {
    var query = "SELECT email, 'user' as Source FROM \"user\" WHERE email=:id
                 + " UNION ALL "
                 + "SELECT id, 'iot' as Source FROM iot WHERE id=:id;"

    if (sequelize.getDialect() === 'mysql') {
         query = query.replace('"','`')
    }
    console.log('search_iot_or_user >>>>>>>>>>>>>>>>>>>>query:\n', query)
    return sequelize.query(query, {replacements: {id: id}, type: Sequelize.QueryTypes.SELECT})
}

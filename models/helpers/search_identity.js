const config_service = require('../../lib/configService.js');
const config = config_service.get_config().database;
const logs = require('../../config.js').debug;

// Load ORM Model
const Sequelize = require('sequelize');

// Use BBDD Mysql
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  logging: logs,
  port: config.port,
  dialect: config.dialect
});

// Helper to find info about pep proxy or user
exports.search_pep_or_user = function (id) {
  let query =
    'SELECT email, \'user\' as source FROM "user" WHERE email=:id' +
    ' UNION ALL ' +
    "SELECT id, 'pep_proxy' as source FROM pep_proxy WHERE id=:id;";

  if (sequelize.getDialect() === 'mysql') {
    query = query.replace(/"/gi, '');
  }

  return sequelize.query(query, {
    replacements: { id },
    type: Sequelize.QueryTypes.SELECT
  });
};

// Helper to find info about iot or user
exports.search_iot_or_user = function (id) {
  let query =
    'SELECT email, \'user\' as source FROM "user" WHERE email=:id' +
    ' UNION ALL ' +
    "SELECT id, 'iot' as source FROM iot WHERE id=:id;";

  if (sequelize.getDialect() === 'mysql') {
    query = query.replace(/"/gi, '');
  }

  return sequelize.query(query, {
    replacements: { id },
    type: Sequelize.QueryTypes.SELECT
  });
};

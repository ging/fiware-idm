const config = require('../../config.js').database;

// Load ORM Model
const Sequelize = require('sequelize');

// Use BBDD Mysql
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

// Helper to find info about pep proxy or user
exports.search_pep_or_user = function(id) {
  const query = `SELECT email, 'user' as Source FROM user WHERE email=:id
                 UNION ALL
                 SELECT id, 'pep_proxy' as Source FROM pep_proxy WHERE id=:id;`;

  return sequelize.query(query, {
    replacements: { id },
    type: Sequelize.QueryTypes.SELECT,
  });
};

// Helper to find info about iot or user
exports.search_iot_or_user = function(id) {
  const query = `SELECT email, 'user' as Source FROM user WHERE email=:id
                 UNION ALL
                 SELECT id, 'iot' as Source FROM iot WHERE id=:id;`;

  return sequelize.query(query, {
    replacements: { id },
    type: Sequelize.QueryTypes.SELECT,
  });
};

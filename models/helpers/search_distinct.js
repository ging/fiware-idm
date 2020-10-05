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
module.exports = function (table, join_table, entity_id, entity_type, key, offset_value, count_rows, role) {
  let select = 'SELECT DISTINCT ' + table + '.' + join_table + '_id,';
  if (join_table === 'user') {
    select = select + '`user`.id, `user`.username, `user`.image, `user`.gravatar, `user`.email';
  } else if (join_table === 'organization') {
    select = select + 'organization.id, organization.name, organization.image, organization.description';
  } else if (join_table === 'oauth_client') {
    select = select + 'oauth_client.id, oauth_client.name, oauth_client.image, oauth_client.url';
  }

  const from = String('FROM ' + table);
  let join;
  if (join_table === 'user') {
    join = 'RIGHT JOIN (SELECT * FROM `' + join_table + '` WHERE username LIKE :key) AS `' + join_table + '`';
  } else {
    join = String('RIGHT JOIN (SELECT * FROM ' + join_table + ' WHERE name LIKE :key) AS ' + join_table);
  }
  const on = 'ON ' + table + '.' + join_table + '_id=`' + join_table + '`.id';
  const where = 'WHERE ' + entity_type + '_id=:entity_id';
  let and = '';
  if (table === 'role_assignment') {
    if (['user', 'organization'].includes(join_table) && !role) {
      and = 'AND ' + join_table + '_id IS NOT NULL';
    } else if (join_table === 'oauth_client' && role !== undefined) {
      if (role === 'other') {
        and = "AND role_id NOT IN ('provider', 'purchaser')";
      } else {
        and = 'AND role_id=:role';
      }
    }
  }
  const limit = 'LIMIT 5';
  const offset = 'OFFSET :offset';

  const count = count_rows
    ? ',(SELECT COUNT(DISTINCT ' + join_table + '_id) ' + from + ' ' + join + ' ' + on + ' ' + where + ') AS count'
    : '';

  let query =
    select +
    '\n' +
    count +
    (count_rows ? '\n' : '') +
    from +
    '\n' +
    join +
    '\n' +
    on +
    '\n' +
    where +
    '\n' +
    and +
    '\n' +
    limit +
    '\n' +
    offset;

  if (sequelize.getDialect() === 'postgres') {
    query = query.replace(/`/gi, '"');
  }

  return sequelize.query(query, {
    replacements: { entity_id, key, offset: offset_value, role },
    type: Sequelize.QueryTypes.SELECT
  });
};

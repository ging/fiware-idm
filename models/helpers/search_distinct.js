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
module.exports = function(table, join_table, entity_id, entity_type, key, offset_value, count_rows, role) {
	var select = 'SELECT DISTINCT '+table+'.'+join_table+'_id,'
	if (join_table === 'user') {
		select = select + '"user".id, "user".username, "user".image, "user".gravatar, "user".email'
	} else if (join_table === 'organization') {
		select = select + 'organization.id, organization.name, organization.image, organization.description'
	} else if (join_table === 'oauth_client') {
		select = select + 'oauth_client.id, oauth_client.name, oauth_client.image, oauth_client.url'
	}

	var from = 'FROM ' + table + ''
	if (join_table === 'user') {
		var join = 'RIGHT JOIN (SELECT * FROM "'+join_table+'" WHERE username LIKE :key) AS "'+join_table+'"'
	} else {
		var join = 'RIGHT JOIN (SELECT * FROM '+join_table+' WHERE name LIKE :key) AS '+join_table+''
	}
	var on = 'ON '+table+'.'+join_table+'_id="'+join_table+'".id'
	var where = 'WHERE '+entity_type+'_id=:entity_id'
	var and = ''
	if (table==='role_assignment') {
		if (['user', 'organization'].includes(join_table) && !role) {
			and = 'AND '+join_table+'_id IS NOT NULL'
		} else if (join_table === 'oauth_client' && role !== undefined) {
			if (role === 'other')  {
				and = "AND role_id NOT IN ('provider', 'purchaser')"
			} else {
				and = 'AND role_id=:role'
			}
		}
	}
	var limit = 'LIMIT 5'
	var offset = 'OFFSET :offset'

	var count = (count_rows)
		? ',(SELECT COUNT(DISTINCT '+join_table+'_id)' + ' ' + from + ' ' + join + ' ' + on + ' ' + where + ') AS count'
		: ''

	var query =   select + '\n' +
				  count + (count_rows ? '\n' : '') +
				  from + '\n' +
				  join + '\n' +
				  on + '\n' +
				  where + '\n' +
				  and + '\n' +
				  limit + '\n' +
				  offset


    return sequelize.query(query, {replacements: {entity_id: entity_id, key: key, offset: offset_value, role: role}, type: Sequelize.QueryTypes.SELECT})
}

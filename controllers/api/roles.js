var debug = require('debug')('idm:api-roles');
var models = require('../../models/models.js');
var uuid = require('uuid');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

// MW to Autoload info if path include roleId
exports.load_role = function(req, res, next, roleId) {

	debug("--> load_role");

	if (roleId === 'provider' || roleId === 'purchaser') {
		res.status(403).json({error: {message: "Not allowed", code: 403, title: "Forbidden"}})
	} else {
		// Search role whose id is roleId
		models.role.findOne({
			where: { id: roleId, oauth_client_id: req.application.id}	
		}).then(function(role) {
			// If role exists, set image from file system
			if (role) {
				req.role = role
				next();
			} else {
				res.status(404).json({error: {message: "Role not found", code: 404, title: "Not Found"}})
			}
		}).catch(function(error) { 
			debug('Error: ' + error)
			if (!error.error) {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
			res.status(error.error.code).json(error)
		});
	}
}

// GET /v1/:applicationId/roles' -- Send index of roles
exports.index = function(req, res) {
	debug('--> index')
	
	// Search organizations in wich user is member or owner
	models.role.findAll({
		where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
		attributes: ['id', 'name'],
		order: [['id', 'DESC']]
	}).then(function(roles) {
		if (roles.length > 0)
			res.status(201).json({roles: roles});
		else {
			res.status(404).json({error: {message: "Roles not found", code: 404, title: "Not Found"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// POST /v1/:applicationId/roles' -- Create role
exports.create = function(req, res) {
	debug('--> create')
	
	check_create_body_request(req.body).then(function() {
		// Build a row and validate if input values are correct (not empty) before saving values in role table
		var role = models.role.build({ 
			id: uuid.v4(),
			is_internal: false, 
			name: req.body.role.name, 
			oauth_client_id: req.application.id 
		});

		return role.save({fields: ["id", "is_internal", "name", "oauth_client_id"]})
	}).then(function(role) {
		res.status(201).json({role: role});
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// GET /v1/:applicationId/roles/:roleId -- Get info about role
exports.info = function(req, res) {
	debug('--> info')

	res.status(201).json({role: req.role});
}

// PATCH /v1/:applicationId/roles/:roleId -- Edit role
exports.update = function(req, res) {
	debug('--> update')
	
	var application_previous_values = null

	check_update_body_request(req.body).then(function() {
		
		role_previous_values = JSON.parse(JSON.stringify(req.role.dataValues))

		req.role.name = (req.body.role.name) ? req.body.role.name : req.role.name 

		return req.role.save()
	}).then(function(role) {
		
		var difference = diffObject(role_previous_values, role.dataValues)
		var response = (Object.keys(difference).length > 0) ? {values_updated: difference} : {message: "Request don't change the role parameters", code: 200, title: "OK"}
		res.status(200).json(response);

	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// DELETE /v1/:applicationId/roles/:roleId -- Delete role
exports.delete = function(req, res) {
	debug('--> delete')
	
	req.role.destroy().then(function() {
		res.status(204).json("Role "+req.params.roleId+" destroyed");
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}


// Check body in create request
function check_create_body_request(body) {

	return new Promise(function(resolve, reject) {
		if (!body.role) {
			reject({error: {message: "Missing parameter role in body request", code: 400, title: "Bad Request"}})			
		}

		if (!body.role.name) {
			reject({error: {message: "Missing parameter name in body request or empty name", code: 400, title: "Bad Request"}})
		}

		resolve()

	})	
}

// Check body in update request
function check_update_body_request(body) {

	return new Promise(function(resolve, reject) {
		if (!body.role) {
			reject({error: {message: "Missing parameter role in body request", code: 400, title: "Bad Request"}})			
		}

		if (body.role.name && body.role.name.length === 0) {
			reject({error: {message: "Cannot set empty name", code: 400, title: "Bad Request"}})
		}

		if (body.role.id || body.role.is_internal) {
			reject({error: {message: "Cannot set id or is_internal", code: 400, title: "Bad Request"}})
		}

		resolve()
	})	
}

// Compare objects with symmetrical keys
function diffObject(a, b) {
  return Object.keys(a).reduce(function(map, k) {
    if (a[k] !== b[k]) map[k] = b[k];
    return map;
  }, {});
}
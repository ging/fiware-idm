var debug = require('debug')('idm:api-permissions');
var models = require('../../models/models.js');
var uuid = require('uuid');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

// MW to Autoload info if path include permissionId
exports.load_permission = function(req, res, next, permissionId) {

	debug("--> load_permission");

	if (['1', '2', '3', '4', '5', '6'].includes(permissionId)) {
		res.status(403).json({error: {message: "Not allowed", code: 403, title: "Forbidden"}})
	} else {
		// Search permission whose id is permissionId
		models.permission.findOne({
			where: { id: permissionId, oauth_client_id: req.application.id}	
		}).then(function(permission) {
			// If permission exists, set image from file system
			if (permission) {
				req.permission = permission
				next();
			} else {
				res.status(404).json({error: {message: "permission not found", code: 404, title: "Bad Request"}})
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

// GET /v1/:applicationId/permissions -- Send index of permissions
exports.index = function(req, res) {
	debug('--> index')
	
	// Search organizations in wich user is member or owner
	models.permission.findAll({
		where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
		attributes: ['id', 'name', 'description', 'action', 'resource', 'xml'],
		order: [['id', 'DESC']]
	}).then(function(permissions) {
		for (var i = 0; i < permissions.length; i++) {
			debug(permissions[i].id)
			if (['1', '2', '3', '4', '5', '6'].includes(permissions[i].id)) {
				delete permissions[i].dataValues.description
				delete permissions[i].dataValues.action
				delete permissions[i].dataValues.resource
				delete permissions[i].dataValues.xml
			}
		}
		if (permissions.length > 0)
			res.status(201).json({permissions: permissions});
		else {
			res.status(404).json({error: {message: "permissions not found", code: 404, title: "Bad Request"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// POST /v1/:applicationId/permissions -- Create permission
exports.create = function(req, res) {
	debug('--> create')
	
	check_create_body_request(req.body).then(function(rule) {
		// Build a row and validate if input values are correct (not empty) before saving values in permission table
		var permission = models.permission.build(req.body.permission);
		permission.id = uuid.v4()
		permission.is_internal = false
		permission.oauth_client_id = req.application.id 

		return permission.save({fields: ["id", "is_internal", "name", "action", "resource", "xml", "oauth_client_id"]})
	}).then(function(permission) {
		res.status(201).json({permission: permission});
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// GET /v1/:applicationId/permissions/:permissionId -- Get info about permission
exports.info = function(req, res) {
	debug('--> info')

	res.status(201).json({permission: req.permission});
}

// PATCH /v1/:applicationId/permissions/:permissionId -- Edit permission
exports.update = function(req, res) {
	debug('--> update')
	
	var application_previous_values = null

	check_update_body_request(req.body).then(function() {
		
		permission_previous_values = JSON.parse(JSON.stringify(req.permission.dataValues))

		req.permission.name = (req.body.permission.name) ? req.body.permission.name : req.permission.name
		req.permission.description = (req.body.permission.description) ? req.body.permission.description : req.permission.description 
		if (req.body.permission.action && req.body.permission.resource) {
			req.permission.action = req.body.permission.action
			req.permission.resource = req.body.permission.resource
			req.permission.xml = null
		}
		if (req.body.permission.xml) {
			req.permission.xml = req.body.permission.xml
			req.permission.action = null
			req.permission.resource = null
		}

		return req.permission.save()
	}).then(function(permission) {
		
		var difference = diffObject(permission_previous_values, permission.dataValues)
		var response = (Object.keys(difference).length > 0) ? {values_updated: difference} : {message: "Request don't change the permission parameters", code: 200, title: "OK"}
		res.status(200).json(response);

	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// DELETE /v1/:applicationId/permissions/:permissionId -- Delete permission
exports.delete = function(req, res) {
	debug('--> delete')
	
	req.permission.destroy().then(function() {
		res.status(204).json("Permission "+req.params.permissionId+" destroyed");
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
		if (!body.permission) {
			reject({error: {message: "Missing parameter permission in body request", code: 400, title: "Bad Request"}})			
		}

		if (!body.permission.name) {
			reject({error: {message: "Missing parameter name in body request or empty name", code: 400, title: "Bad Request"}})
		}

		if ((body.permission.resource || body.permission.action) && body.permission.xml) {
			reject({error: {message: "Cannot set action and resource at the same time as xacml rule", code: 400, title: "Bad Request"}})
		}

		if(!(body.permission.action && body.permission.resource) && !body.permission.xml){
			reject({error: {message: "Set action and resource or an advanced xacml rule", code: 400, title: "Bad Request"}})
		}
		
		resolve()
	})	
}

// Check body in update request
function check_update_body_request(body) {

	return new Promise(function(resolve, reject) {
		if (!body.permission) {
			reject({error: {message: "Missing parameter permission in body request", code: 400, title: "Bad Request"}})			
		}

		if (body.permission.name && body.permission.name.length === 0) {
			reject({error: {message: "Cannot set empty name", code: 400, title: "Bad Request"}})
		}

		if (body.permission.id || body.permission.is_internal) {
			reject({error: {message: "Cannot set id or is_internal", code: 400, title: "Bad Request"}})
		}

		if ((body.permission.resource || body.permission.action) && body.permission.xml) {
			reject({error: {message: "Cannot set action and resource at the same time as xacml rule", code: 400, title: "Bad Request"}})
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
var debug = require('debug')('idm:api-applications');
var models = require('../../models/models.js');
var uuid = require('uuid');
var _ = require('lodash');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

// MW to Autoload info if path include applicationId
exports.load_application = function(req, res, next, applicationId) {

	debug("--> load_application");

	if (applicationId === 'idm_admin_app') {
		res.status(403).json({error: {message: "Not allowed", code: 403, title: "Forbidden"}})
	} else {
		// Search application whose id is applicationId
		models.oauth_client.findById(applicationId).then(function(application) {
			// If application exists, set image from file system
			if (application) {
				req.application = application
				next();
			} else {
				res.status(404).json({error: {message: "Application not found", code: 404, title: "Bad Request"}})
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

// GET /v1/applications -- Send index of applications
exports.index = function(req, res) {
	debug('--> index')

	// Search organizations in wich user is member or owner
	var search_organizations = models.user_organization.findAll({ 
		where: { user_id: req.user.id },
		include: [{
			model: models.organization,
			attributes: ['id']
		}]
	})
	search_organizations.then(function(organizations) {
		return models.role_assignment.findAll({
			where: { [Op.or]: [{ organization_id: organizations.map(elem => elem.organization_id)}, 
							   {user_id: req.user.id}]},
			include: [{
				model: models.oauth_client,
				attributes: ['id' ,
							 'name', 
							 'description', 
							 'image',
							 'url', 
							 'redirect_uri', 
							 'grant_type', 
							 'response_type', 
							 'client_type']
			}]
		})
	}).then(function(applications) {
		var applications_filtered = _.uniqBy(applications.map(elem=> elem.OauthClient.dataValues), 'id');
		res.status(201).json({user_applications: applications_filtered});
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})	
}

// POST /v1/applications -- Create application
exports.create = function(req, res) {
	debug("--> create");

	// Build a row and validate if input values are correct (not empty) before saving values in oauth_client
	check_create_body_request(req.body).then(function(oauth_type) {
		
		var application = models.oauth_client.build(req.body.application);
		
		application.image = 'default'
		application.id = uuid.v4()
		application.secret = uuid.v4()
		if (oauth_type.grant_type.length > 0) {
			application.grant_type = oauth_type.grant_type
			application.response_type = oauth_type.response_type
		} else {
			application.grant_type = ['client_credentials', 'password', 'implicit', 'authorization_code', 'refresh_token']
			application.response_type = ['code', 'token']
		}

		var create_application = application.save({fields: ['id', 
										  'secret', 
										  'name', 
									      'description', 
									      'url', 
									      'redirect_uri', 
									      'image',
									      'grant_type',
									      'response_type'] })

		var create_assignment = create_application.then(function(application) {
			return models.role_assignment.create({
				oauth_client_id: application.id, 
		        role_id: 'provider', 
		        user_id: req.user.id
		    })
		}) 

		return Promise.all([create_application, create_assignment]).then(function(values) {
			res.status(201).json({application: values[0].dataValues});
		}).catch(function(error) { return Promise.reject(error) })
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// GET /v1/applications/:applicationId -- Get info about application
exports.info = function(req, res) {
	debug('--> info')

	res.status(201).json({application: req.application.dataValues});
}

// PATCH /v1/applications/:applicationId -- Edit application
exports.update = function(req, res) {
	debug('--> update')
	
	var application_previous_values = null

	check_update_body_request(req.body).then(function(oauth_type) {
		
		application_previous_values = JSON.parse(JSON.stringify(req.application.dataValues))

		req.application.name = (req.body.application.name) ? req.body.application.name : req.application.name 
		req.application.description = (req.body.application.description) ? req.body.application.description : req.application.description
		req.application.url = (req.body.application.url) ? req.body.application.url : req.application.url
		req.application.redirect_uri = (req.body.application.redirect_uri) ? req.body.application.redirect_uri : req.application.redirect_uri
		req.application.client_type = (req.body.application.client_type) ? req.body.application.client_type : req.application.client_type
		req.application.image = 'default'

		if (oauth_type) {
			req.application.grant_type = oauth_type.grant_type
			req.application.response_type = oauth_type.response_type
		}

		return req.application.save()
	}).then(function(application) {
		
		var difference = diffObject(application_previous_values, application.dataValues)
		var response = (Object.keys(difference).length > 0) ? {values_updated: difference} : {message: "Request don't change the application parameters", code: 200, title: "OK"}
		res.status(200).json(response);

	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// DELETE /v1/applications/:applicationId -- Delete application
exports.delete = function(req, res) {
	debug('--> delete')

	req.application.destroy().then(function() {
		res.status(204).json("Appication "+req.params.applicationId+" destroyed");
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
		if (!body.application) {
			reject({error: {message: "Missing parameter application in body request", code: 400, title: "Bad Request"}})			
		}

		if (!body.application.name) {
			reject({error: {message: "Missing parameter name in body request or empty name", code: 400, title: "Bad Request"}})
		}

		if (!body.application.redirect_uri) {
			reject({error: {message: "Missing parameter redirect_uri in body request", code: 400, title: "Bad Request"}})
		}

		var oauth_types = { grant_type: [], response_type: []}

		if (body.application.grant_type) {
			if (body.application.grant_type.includes('client_credentials')) {
				oauth_types.grant_type.push('client_credentials')
			}
			if (body.application.grant_type.includes('password')) {
				oauth_types.grant_type.push('password')
			}
			if (body.application.grant_type.includes('authorization_code')) {
				oauth_types.grant_type.push('authorization_code')
				oauth_types.response_type.push('code')
			}
			if (body.application.grant_type.includes('implicit')) {
				oauth_types.grant_type.push('implicit')
				oauth_types.response_type.push('token')
			}
			if (body.application.grant_type.includes('refresh_token')) {
				oauth_types.grant_type.push('refresh_token')
			}
		}


		if (body.application.grant_type && oauth_types.grant_type.length <= 0) {
			reject({error: {message: "Invalid Grant Type", code: 400, title: "Bad Request"}})
		} else {
			resolve(oauth_types)
		}

	})	
}

// Check body in update request
function check_update_body_request(body) {

	return new Promise(function(resolve, reject) {
		if (!body.application) {
			reject({error: {message: "Missing parameter application in body request", code: 400, title: "Bad Request"}})			
		}

		if (body.application.name && body.application.name.length === 0) {
			reject({error: {message: "Cannot set empty name", code: 400, title: "Bad Request"}})
		}

		if (body.application.redirect_uri && body.application.redirect_uri.length === 0) {
			reject({error: {message: "Cannot set empty redirect_uri", code: 400, title: "Bad Request"}})
		}

		if (body.application.id || body.application.secret || body.application.response_type) {
			reject({error: {message: "Cannot set id, secret or response_type", code: 400, title: "Bad Request"}})
		}

		if (body.application.grant_type) {
			var oauth_types = { grant_type: [], response_type: []}

			if (body.application.grant_type.includes('client_credentials')) {
				oauth_types.grant_type.push('client_credentials')
			}
			if (body.application.grant_type.includes('password')) {
				oauth_types.grant_type.push('password')
			}
			if (body.application.grant_type.includes('authorization_code')) {
				oauth_types.grant_type.push('authorization_code')
				oauth_types.response_type.push('code')
			}
			if (body.application.grant_type.includes('implicit')) {
				oauth_types.grant_type.push('implicit')
				oauth_types.response_type.push('token')
			}
			if (body.application.grant_type.includes('refresh_token')) {
				oauth_types.grant_type.push('refresh_token')
			}

			if (oauth_types.grant_type.length <= 0) {
				reject({error: {message: "Invalid Grant Type", code: 400, title: "Bad Request"}})
			} else {
				resolve(oauth_types)
			}
		} else {
			resolve()
		}
	})	
}

// Compare objects with symmetrical keys
function diffObject(a, b) {
  return Object.keys(a).reduce(function(map, k) {
    if (a[k] !== b[k]) map[k] = b[k];
    return map;
  }, {});
}
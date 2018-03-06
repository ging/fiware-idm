var debug = require('debug')('idm:api-applications');
var models = require('../../models/models.js');
var uuid = require('uuid');
var _ = require('lodash');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

// MW to check if id of application is valid
exports.check_application = function(req, res, next) {
	if (req.params.applicationId === 'idm_admin_app') {
		res.status(404).json({error: {message: "Application not found", code: 404, title: "Bad Request"}})
	} else {
		next()
	}
}

// GET /v1/applications -- Send index of applications
exports.index = function(req, res) {
	debug('--> index')

	// Search organizations in wich user is member or owner
	var search_organizations = models.user_organization.findAll({ 
		where: { user_id: req.user_id },
		include: [{
			model: models.organization,
			attributes: ['id']
		}]
	})
	search_organizations.then(function(organizations) {
		return models.role_assignment.findAll({
			where: { [Op.or]: [{ organization_id: organizations.map(elem => elem.organization_id)}, 
							   {user_id: req.user_id}]},
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
	check_create_body_request(req.body).then(function(grant_type) {
		
		var application = models.oauth_client.build(req.body.application);
	
		application.id = uuid.v4()
		application.secret = uuid.v4()
		application.grant_type = grant_type[0]
		application.response_type = (grant_type.length > 1) ? grant_type[1] : null

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
		        user_id: req.user_id
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

	models.oauth_client.findOne({
		where: { id: req.params.applicationId}
	}).then(function(application) {
		if (application) {
			res.status(201).json({application: application.dataValues});
		} else {
			return Promise.reject({error: {message: "Application not found", code: 404, title: "Bad Request"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// PATCH /v1/applications/:applicationId -- Edit application
exports.update = function(req, res) {
	debug('--> update')
	
	check_update_body_request(req.body).then(function(grant_type) {
		
		return models.oauth_client.findOne({
			where: { id: req.params.applicationId}
		}).then(function(application) {

			if (!application) {
				return Promise.reject({error: {message: "Application not found", code: 404, title: "Bad Request"}})
			} else {
				var application_previous_values = JSON.parse(JSON.stringify(application.dataValues))
				application.name = (req.body.application.name) ? req.body.application.name : application.name 
				application.description = (req.body.application.description) ? req.body.application.description : application.description
				application.url = (req.body.application.url) ? req.body.application.url : application.url
				application.redirect_uri = (req.body.application.redirect_uri) ? req.body.application.redirect_uri : application.redirect_uri
				application.image = (req.body.application.image) ? req.body.application.image : application.image
				application.client_type = (req.body.application.client_type) ? req.body.application.client_type : application.client_type
				
				if (grant_type) {
					application.grant_type = grant_type[0]
					application.response_type = (grant_type.length > 1) ? grant_type[1] : null
				}

				return application.save().then(function() {
					var difference = diffObject(application_previous_values, application.dataValues)
					var response = (Object.keys(difference).length > 0) ? {values_updated: difference} : {message: "Request don't change the application parameters", code: 200, title: "OK"}
					res.status(200).json(response);
				}).catch(function(error) {
					return Promise.reject(error)
				})
			}
		}).catch(function(error) {
			return Promise.reject(error)
		})
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

	models.oauth_client.destroy({
		where: { id: req.params.applicationId}
	}).then(function(destroyed) {
		if (destroyed) {
			res.status(204).json("Appication "+req.params.applicationId+" destroyed");
		} else {
			return Promise.reject({error: {message: "Application not found", code: 404, title: "Bad Request"}})
		}
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

		if (!body.application.name && body.application.name.length === 0) {
			reject({error: {message: "Missing parameter name in body request or empty name", code: 400, title: "Bad Request"}})
		}

		switch(body.application.grant_type) {
			case 'client_credentials':
				resolve(['client_credentials'])
				break;
			case 'password':
				resolve(['password'])
				break;
			case 'authorization_code':
				resolve(['authorization_code', 'code'])
				break;
			case 'implicit':
				resolve(['implicit', 'token'])
				break;
			default:
				reject({error: {message: "Invalid Grant Type", code: 400, title: "Bad Request"}})
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

		if (body.application.id || body.application.secret || body.application.response_type) {
			reject({error: {message: "Cannot set id, secret or response_type", code: 400, title: "Bad Request"}})
		}

		if (body.application.grant_type) {
			switch(body.application.grant_type) {
				case 'client_credentials':
					resolve(['client_credentials'])
					break;
				case 'password':
					resolve(['password'])
					break;
				case 'authorization_code':
					resolve(['authorization_code', 'code'])
					break;
				case 'implicit':
					resolve(['implicit', 'token'])
					break;
				default:
					reject({error: {message: "Invalid Grant Type", code: 400, title: "Bad Request"}})
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
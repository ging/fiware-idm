var debug = require('debug')('idm:api-organizations');
var models = require('../../models/models.js');
var uuid = require('uuid');

// GET /v1/organizations -- Send index of organizations
exports.index = function(req, res) {
	debug('--> index')

	// Search organizations in wich user is member or owner
	models.user_organization.findAll({
		where: {user_id: req.user.id},
		attributes: ['role'],
		include: [{
			model: models.organization,
			attributes: ['id',
						 'name', 
						 'description', 
						 'image',
						 'website']
		}]
	}).then(function(organizations) {
		if (organizations.length > 0)
			res.status(201).json({organizations: organizations});
		else {
			res.status(404).json({error: {message: "Organizations not found", code: 404, title: "Bad Request"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// POST /v1/organizations -- Create organization
exports.create = function(req, res) {
	debug("--> create");

	// Build a row and validate if input values are correct (not empty) before saving values in oauth_client
	check_create_body_request(req.body).then(function(oauth_type) {
		
		var organization = models.organization.build(req.body.organization);
		
		organization.image = 'default'
		organization.id = uuid.v4()

		var create_organization = organization.save(
			{ fields: ['id',  
					  'name', 
				      'description', 
				      'website',  
				      'image' ] 
			}
		)

		var create_assignment = create_organization.then(function(organization) {
			return models.user_organization.create({
				organization_id: organization.id, 
		        role: 'owner', 
		        user_id: req.user.id
		    })
		}) 

		return Promise.all([create_organization, create_assignment]).then(function(values) {
			res.status(201).json({organization: values[0].dataValues});
		}).catch(function(error) { return Promise.reject(error) })
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// GET /v1/organizations/:organizationId -- Get info about organization
exports.info = function(req, res) {
	debug('--> info')

	models.organization.findOne({
		where: { id: req.params.organizationId}
	}).then(function(organization) {
		if (organization) {
			res.status(201).json({organization: organization.dataValues});
		} else {
			return Promise.reject({error: {message: "organization not found", code: 404, title: "Bad Request"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// PUT /v1/organizations/:organizationId -- Edit organization
exports.update = function(req, res) {
	debug('--> update')
	
	check_update_body_request(req.body).then(function() {
		
		return models.organization.findOne({
			where: { id: req.params.organizationId}
		}).then(function(organization) {

			if (!organization) {
				return Promise.reject({error: {message: "organization not found", code: 404, title: "Bad Request"}})
			} else {
				var organization_previous_values = JSON.parse(JSON.stringify(organization.dataValues))

				organization.name = (req.body.organization.name) ? req.body.organization.name : organization.name 
				organization.website = (req.body.organization.website) ? req.body.organization.website : organization.website 
				organization.description = (req.body.organization.description) ? req.body.organization.description : organization.description
				organization.image = 'default'

				return organization.save().then(function() {
					var difference = diffObject(organization_previous_values, organization.dataValues)
					var response = (Object.keys(difference).length > 0) ? {values_updated: difference} : {message: "Request don't change the organization parameters", code: 200, title: "OK"}
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

// DELETE /v1/organizations/:organizationId -- Delete organization
exports.delete = function(req, res) {
	debug('--> delete')

	models.organization.destroy({
		where: { id: req.params.organizationId}
	}).then(function(destroyed) {
		if (destroyed) {
			res.status(204).json("Organization "+req.params.organizationId+" destroyed");
		} else {
			return Promise.reject({error: {message: "organization not found", code: 404, title: "Bad Request"}})
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
		if (!body.organization) {
			reject({error: {message: "Missing parameter organization in body request", code: 400, title: "Bad Request"}})			
		}

		else if (!body.organization.name) {
			reject({error: {message: "Missing parameter name in body request or empty name", code: 400, title: "Bad Request"}})
		}

		else {
			resolve()
		}

	})	
}

// Check body in update request
function check_update_body_request(body) {

	return new Promise(function(resolve, reject) {
		if (!body.organization) {
			reject({error: {message: "Missing parameter organization in body request", code: 400, title: "Bad Request"}})			
		}

		else if (body.organization.id) {
			reject({error: {message: "Cannot set id", code: 400, title: "Bad Request"}})
		}

		else if (body.organization.name && body.organization.name.length === 0) {
			reject({error: {message: "Cannot set empty name", code: 400, title: "Bad Request"}})
		}

		else {
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
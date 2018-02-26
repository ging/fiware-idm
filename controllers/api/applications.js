var debug = require('debug')('idm:api-applications');
var models = require('../../models/models.js');

// GET /v1/applications -- Send index of applications
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST /v1/applications -- Create application
exports.create = function(req, res) {
	debug("--> create");

	if (req.body.consumer.id || req.body.consumer.secret) {
		res.status(400).json({ error: {message: 'Cannot set some attributes', code: 400, title: 'Bad Request'}})
	} else {
		// Build a row and validate if input values are correct (not empty) before saving values in oauth_client
		var application = models.oauth_client.build(req.body.consumer);
		application.grant_type = 'authorization_code'
		application.response_type = 'code'
		var validate = application.validate()
		var save = validate.then(function() {
			return application.save({fields: ['name', 
										'description', 
										'url', 
										'redirect_uri', 
										'image',
										'grant_type',
										'response_type'] })
		})/*.catch(function(error) {
			debug(error)
		})*/
 	
 		save.then(function(cosa) {
 			debug(cosa)
 			res.send("okasss")
 		}).catch(function(error) {
 			debug(error.errors)
 			res.send("bad")
 		})
		/*// See if the user or the organization will be the provider of the application
		if (req.body.provider !== req.session.user.id) {

			// Check if user is owner of the organization send
			var organizations = models.user_organization.findOne({
				where: { user_id: req.session.user.id, organization_id: req.body.provider, role: 'owner'}
			})

			// Create row in db role_assignment if organization exists
			var create_row = organizations.then(function(row) {
				if (row) {
					return models.role_assignment.create({
						oauth_client_id: application.id, 
		    		role_id: 'provider', 
		    		organization_id: req.body.provider,
		    		role_organization: 'owner'
		    	})
				} else {
					return Promise.reject()
				}
			}).catch(function(error) {
				return Promise.reject("no_organization")
			});

			// If application is save in oauth_client_id, create assignment in role_assignment db
			var assign = save.then(function() {
				return create_row
			})

		} else {
			// If application is save in oauth_client_id, create assignment in role_assignment db
			var assign = save.then(function() {
				return models.role_assignment.create({
					oauth_client_id: application.id, 
	        role_id: 'provider', 
	        user_id: req.session.user.id
	      })
			})
		}
		Promise.all([save, assign]).then(function(values) {
			res.redirect('/idm/applications/'+application.id+'/step/avatar');
		}).catch(function(error){
			if (error === "no_organization") {
				// Destroy application with specific id
				models.oauth_client.destroy({
					where: { id: application.id }
				}).then(function() {
					// Send message of success in deleting application
					req.session.message = {text: " Can't create application.", type: 'danger'};
					res.redirect('/idm/applications')
				}).catch(function(error) {
					// Send message of fail when deleting application
					req.session.message = {text: ' Application create error.', type: 'warning'};
					res.redirect('/idm/applications');
				});
			} else {
				var nameErrors = []
				if (error.errors.length) {
	        		for (var i in error.errors) {
	        			nameErrors.push(error.errors[i].message)
	        		}
	  			}
	  			models.user_organization.findAll({
					where: { user_id: req.session.user.id, role: 'owner'},
					include: [{
						model: models.organization,
						attributes: ['id', 'name']
					}]
				}).then(function(organizations) {
					res.render('applications/new', {application: application, organizations: organizations, errors: nameErrors, csrfToken: req.csrfToken()})		
				}).catch(function(error) { next(error); });
			}
		})*/
	}
}

// GET /v1/applications/:applicationId -- Get info about application
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PATCH /v1/applications/:applicationId -- Edit application
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE /v1/applications/:applicationId -- Delete application
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}
var models = require('../../models/models.js');
var fs = require('fs');
var uuid = require('uuid');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;

var config = require('../../config').database;

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var debug = require('debug')('idm:web-application_controller');
var gravatar = require('gravatar');
var Jimp = require("jimp");

var magic = new Magic(mmm.MAGIC_MIME_TYPE);

var image = require ('../../lib/image.js');

// Autoload info if path include applicationId
exports.load_application = function(req, res, next, applicationId) {

	debug("--> load_application");

	if (applicationId === 'idm_admin_app') {
		// Reponse with message
		var response = {text: ' Application doesn`t exist.', type: 'danger'};

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications');
	} else {
		// Search application whose id is applicationId
		models.oauth_client.findById(applicationId).then(function(application) {
			// If application exists, set image from file system
			if (application) {
				req.application = application
				if (application.image == 'default') {
					req.application.image = '/img/logos/original/app.png'
				} else {
					req.application.image = '/img/applications/'+application.image
				}
				// Send request to next function
				next();
			} else {
				// Reponse with message
				var response = {text: ' Application doesn`t exist.', type: 'danger'};

				// Send response depends on the type of request
				send_response(req, res, response, '/idm/applications');
			}
		}).catch(function(error) { next(error); });		
	}
}

// GET /idm/applications -- List all applications
exports.index = function(req, res) {

	debug("--> index");

	if (req.session.message) {
		res.locals.message = req.session.message;
		delete req.session.message
	}

	var search_organizations = models.user_organization.findAll({ 
		where: { user_id: req.session.user.id },
		include: [{
			model: models.organization,
			attributes: ['id' ,'name']
		}]
	}).then(function(organizations) {
		res.render('applications/index', { organizations: organizations, csrfToken: req.csrfToken()});
	}).catch(function(error) {
		debug('Error: ' + error)
		res.render('applications/index', { organizations: [], csrfToken: req.csrfToken()});
	})
};

// GET /idm/applications/filtered_user -- Filter applications of user by page
exports.filter_user = function(req, res, next) {
	
	debug("--> filter_user");
	
	var offset = (req.query.page) ? (req.query.page - 1)*5 : 0
	models.helpers.search_distinct('role_assignment', 'oauth_client', req.session.user.id, 'user', '%%', offset, true, req.query.role).then(function(user_applications) {

		var count = 0
		// If user has applications, set image from file system and obtain info from each application
		if (user_applications.length > 0) {
			count = user_applications[0].count
			user_applications.forEach(function(app) {
				if (app.image == 'default') {
					app.image = '/img/logos/medium/app.png'
				} else {
					app.image = '/img/applications/'+app.image
				}
			});
		}

		res.send({applications: user_applications, number_applications: count})

    }).catch(function(error) {
    	debug('Error get users authorized: ' + error)
		var message = {text: ' Unable to find user applications',type: 'danger'}
		send_response(req, res, message, '/idm/applications')
    });
}

// GET /idm/applications/filtered_organization -- Filter applications of user organization by page
exports.filter_organization = function(req, res) {
	
	debug("--> filter_organization");

	var offset = (req.query.page) ? (req.query.page - 1)*5 : 0

	models.helpers.search_distinct('role_assignment', 'oauth_client', req.query.organization, 'organization', '%%', offset, true, req.query.role).then(function(org_applications) {

		var count = 0
		// If user has applications, set image from file system and obtain info from each application
		if (org_applications.length > 0) {
			count = org_applications[0].count
			org_applications.forEach(function(app) {
				if (app.image == 'default') {
					app.image = '/img/logos/medium/app.png'
				} else {
					app.image = '/img/applications/'+app.image
				}
			});
		}

		res.send({applications: org_applications, number_applications: count})

    }).catch(function(error) {
    	debug('Error get users authorized: ' + error)
		var message = {text: ' Unable to find user applications',type: 'danger'}
		send_response(req, res, message, '/idm/applications')
    });
}

// GET /idm/applications/:applicationId -- Show info about an application
exports.show = function(req, res, next) {

	debug("--> show");
		
	// Search iot sensors of application
	var search_iots = models.iot.findAll({
		where: { oauth_client_id: req.application.id },
		attributes: ['id'],
	})

	// Search pep proxy of application
	var search_pep = models.pep_proxy.findOne({
		where: { oauth_client_id: req.application.id },
		attributes: ['id'],
	})


	Promise.all([search_iots, search_pep]).then(function(values) {

		var iot_sensors = values[0]
		var pep_proxy = values[1]

		// Send message if error exists
		if (req.session.message) {
			res.locals.message = req.session.message;
			delete req.session.message
		}

		res.render('applications/show', { application: req.application, 
										  user_logged_permissions: req.user_owned_permissions,
										  pep_proxy: pep_proxy,
										  iot_sensors: iot_sensors,																	  
										  errors: [], 
										  csrfToken: req.csrfToken() });
	}).catch(function(error) {
		debug('Error: ' + error)
		
		// Send an error if the the request is via AJAX or redirect if is via browser
		var response = {text: ' Error showing app info.', type: 'danger'};
		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications');
	})
};

// GET /idm/applications/:applicationId/authorize_users -- Send authorizes users of an application
exports.authorized_users = function(req, res, next) {

	debug("--> authorized_users");

	var key = (req.query.key) ? "%"+req.query.key+"%" : "%%"
	var offset = (req.query.page) ? (req.query.page - 1)*5 : 0

	models.helpers.search_distinct('role_assignment', 'user', req.application.id, 'oauth_client', key, offset, true).then(function(users_authorized) {
		var users = []

		var count = 0

		// If user has organizations, set image from file system and obtain info from each organization
		if (users_authorized.length > 0) {
			
			count = users_authorized[0].count

			users_authorized.forEach(function(user) {
				if (user.gravatar) {
        			user.image = gravatar.url(user.email, {s:100, r:'g', d: 'mm'}, {protocol: 'https'});
				} else if (user.image == 'default') {
					user.image = '/img/logos/medium/user.png'
				} else {
					user.image = '/img/users/'+user.image
				}
				users.push({id: user.user_id, username: user.username, image: user.image})
			});
		}
		res.send({users: users, users_number: count})

    }).catch(function(error) {
    	debug('Error get users authorized: ' + error)
		var message = {text: ' Unable to find members',type: 'danger'}
		send_response(req, res, message, '/idm')
    });
}

// GET /idm/applications/:applicationId/authorize_organizations -- Send authorizes organizations of an application
exports.authorized_organizations = function(req, res, next) {

	debug("--> authorized_organizations");

	var key = (req.query.key) ? "%"+req.query.key+"%" : "%%"
	var offset = (req.query.page) ? (req.query.page - 1)*5 : 0

	models.helpers.search_distinct('role_assignment', 'organization', req.application.id, 'oauth_client', key, offset, true).then(function(organizations_authorized) {
		var organizations = []

		var count = 0

		// If user has organizations, set image from file system and obtain info from each organization
		if (organizations_authorized.length > 0) {
			
			count = organizations_authorized[0].count

			organizations_authorized.forEach(function(organization) {
				if (organization.image == 'default') {
					organization.image = '/img/logos/medium/group.png'
				} else {
					organization.image = '/img/organizations/'+organization.image
				}
				organizations.push({id: organization.organization_id, name: organization.name, image: organization.image, description: organization.description})
			});
		}
		res.send({organizations: organizations, organizations_number: count})

    }).catch(function(error) {
    	debug('Error get organizations authorized: ' + error)
		var message = {text: ' Unable to find organizations',type: 'danger'}
		send_response(req, res, message, '/idm')
    });
}

// GET /idm/applications/new -- Render a view to create a new application
exports.new = function(req, res, next) {

	debug("--> new");

	models.user_organization.findAll({
		where: { user_id: req.session.user.id, role: 'owner'},
		include: [{
			model: models.organization,
			attributes: ['id', 'name']
		}]
	}).then(function(organizations) {
		res.render('applications/new', {application: {}, organizations: organizations, errors: [], csrfToken: req.csrfToken()})		
	}).catch(function(error) { next(error); });

};
	
// POST /idm/applications -- Create application
exports.create = function(req, res, next) {

	debug("--> create");

	if (req.body.id || req.body.secret) {
		req.session.message = {text: ' Application creation failed.', type: 'danger'};
		res.redirect('/idm/applications')
	} else {
		// Build a row and validate if input values are correct (not empty) before saving values in oauth_client
		var application = models.oauth_client.build(req.body.application);
		application.grant_type = 'authorization_code'
		application.response_type = 'code'
		var validate = application.validate()
		var save = validate.then(function() {
			application.description.trim()
			return application.save({fields: [ 'id', 
										'name', 
										'description', 
										'url', 
										'redirect_uri', 
										'secret', 
										'image',
										'grant_type',
										'response_type'] })
		})
 
		// See if the user or the organization will be the provider of the application
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
		})
	}
};

// GET /idm/applications/:applicationId/step/avatar -- Form to create avatar when creating an application
exports.step_new_avatar = function(req, res, next) {

	debug("--> step_new_avatar");

	res.render('applications/step_create_avatar', { application: req.application, errors: [], csrfToken: req.csrfToken()});
};

// POST /idm/applications/:applicationId/step/avatar -- Create Avatar when creating an application
exports.step_create_avatar = function(req, res, next) {

	debug("--> step_create_avatar");

	// See if the user has selected a image to upload
	if (req.file) {
		handle_uploaded_images(req, res, '/idm/applications/'+req.application.id+'/step/roles')
	// If not, the default image is assigned to the application
	} else {
		req.application.image = '/img/logos/original/app.png'
		res.redirect('/idm/applications/'+req.application.id+'/step/roles');
	}
};

// GET /idm/applications/:applicationId/step/roles -- Form to assign roles when creating an application
exports.step_new_roles = function(req, res, next) {

	debug("--> step_new_roles");

	// Search roles of application and order them
	models.role.findAll({
		where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
		attributes: ['id', 'name'],
		order: [['id', 'DESC']]
	}).then(function(roles) {
		// Search permissions of application and order them
		models.permission.findAll({
			where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
			attributes: ['id', 'name'], 
			order: [['id', 'ASC']]
		}).then(function(permissions) {
			// Search roles to permission assignment of application using id of roles
			models.role_permission.findAll({
				where: { role_id: roles.map(elem => elem.id) }						
			}).then(function(application_roles_permissions) {
				// Create and object with key as id of role and value an array of permissions id
				role_permission_assign = {}
				for (var i = 0; i < application_roles_permissions.length; i++) {
					if (!role_permission_assign[application_roles_permissions[i].role_id]) {
				        role_permission_assign[application_roles_permissions[i].role_id] = [];
				    }
				    role_permission_assign[application_roles_permissions[i].role_id].push(application_roles_permissions[i].permission_id);
				}
				res.render('applications/step_create_roles', { application: { id: req.application.id, 
																		      roles: roles, 
																		      permissions: permissions,
																		      role_permission_assign: role_permission_assign }, 
															   csrfToken: req.csrfToken()});
			}).catch(function(error) { next(error); });
		}).catch(function(error) { next(error); });
	}).catch(function(error) { next(error); });
};

// GET /idm/applications/:applicationId/edit -- View to edit application
exports.edit = function(req, res) {
	
	debug("--> edit");
	
	res.render('applications/edit', { application: req.application, errors: [], csrfToken: req.csrfToken()});
};

// PUT /idm/applications/:applicationId/edit/avatar -- Update application avatar
exports.update_avatar = function(req, res) {

	debug("--> update_avatar");

	// See if the user has selected a image to upload
	if (req.file) {
		handle_uploaded_images(req, res, '/idm/applications/'+req.application.id)
	// If not redirect to show application info
  	} else {
  		req.session.message = {text: ' fail updating image.', type: 'warning'};
		res.redirect('/idm/applications/'+req.application.id);
  	} 
};

// PUT /idm/applications/:applicationId/edit/info -- Update application information
exports.update_info = function(req, res) {

	debug("--> update_info");

	// If body has parameters id or secret don't update the application
	if (req.body.application.id || req.body.application.secret) {
		res.locals.message = {text: ' Application edit failed.', type: 'danger'};
		res.redirect('/idm/applications/'+req.application.id)
	} else {

		// Build a row and validate if input values are correct (not empty) before saving values in oauth_client table
		req.body.application["id"] = req.application.id;
		var application = models.oauth_client.build(req.body.application);

		application.validate().then(function(err) {
			models.oauth_client.update(
				{ name: req.body.application.name,
				  description: req.body.application.description.trim(),
				  url: req.body.application.url,
				  redirect_uri: req.body.application.redirect_uri },
				{
					fields: ['name','description','url','redirect_uri'],
					where: {id: req.application.id}
				}
			).then(function() {
				// Send message of success of updating the application
				req.session.message = {text: ' Application updated successfully.', type: 'success'};
				res.redirect('/idm/applications/'+req.application.id);
			}).catch(function(error){
				res.locals.message = {text: ' Unable to update application',type: 'danger'}
			 	res.render('applications/edit', { application: application, errors: [], csrfToken: req.csrfToken()});
			});		
		}).catch(function(error){
			// Send message of warning of updating the application
			res.locals.message = {text: ' Application update failed.', type: 'warning'};
			req.body.application['image'] = req.application.image
		 	res.render('applications/edit', { application: req.body.application, errors: error.errors, csrfToken: req.csrfToken()});
		});
	}
};

// DELETE /idm/applications/:applicationId/edit/delete_avatar -- Delete avatar
exports.delete_avatar = function(req, res) {

	debug("--> delete_avatar");

	var image_path = 'public' + req.application.image

	image.destroy(image_path).then(function(val) {
		return models.oauth_client.update(
					{ image: 'default' },
					{
						fields: ["image"],
						where: {id: req.application.id }
					})
	}).then(function(deleted) {
		if (deleted[0] === 1) {
			// Send message of success in deleting image
        	req.application.image = '/img/logos/original/app.png'
            res.send({text: ' Deleted image.', type: 'success'});
		} else {
			// Send message of fail when deleting an image
            res.send({text: ' Failed to delete image.', type: 'danger'});
		}
	}).catch(function(error) {
		res.send({text: ' Failed to delete image.', type: 'danger'});
	})
};

// DELETE /idm/applications/:applicationId -- Delete application
exports.destroy = function(req, res) {

	debug("--> destroy");

	// Destroy application with specific id
	models.oauth_client.destroy({
		where: { id: req.application.id }
	}).then(function() {
		// If the image is not the default one, delete image from filesystem
		if (req.application.image.includes('/img/applications')) {
			var image_name = req.application.image.split('/')[3]
			fs.unlink('./public/img/applications/'+image_name);
		}
		// Send message of success in deleting application
		req.session.message = {text: ' Application deleted.', type: 'success'};
		res.redirect('/idm/applications')
	}).catch(function(error) {
		// Send message of fail when deleting application
		req.session.message = {text: ' Application delete error.', type: 'warning'};
		res.redirect('/idm/applications');
	});
};

// Function to check and crop an image and to update the name in the oauth_client table
function handle_uploaded_images(req, res, redirect_uri) {

	// Check the MIME of the file upload
	var image_path = 'public/img/applications/'+req.file.filename
	image.check(image_path).then(function(val) {
		var crop_points = {x: req.body.x, y: req.body.y, w: req.body.w, h: req.body.h}
		return image.crop(image_path, crop_points)
	}).then(function(val) {
		return models.oauth_client.update(
			{ image: req.file.filename },
			{
				fields: ['image'],
				where: {id: req.application.id}
			}) 
	}).then(function(updated) {
		var old_image = 'public'+req.application.image
		if (updated[0] === 1) {
			// Old image to be deleted
			if (old_image.includes('/img/applications/')) {
				delete_image(req, res, old_image, true, redirect_uri, ' Image updated successfully.')
			} else {
				// Send message of success when updating image
				req.session.message = {text: ' Image updated successfully.', type: 'success'};
				res.redirect(redirect_uri);
			}
		} else {
			delete_image(req, res, image_path, false, redirect_uri, ' Image not updated.')
		}
	}).catch(function(error) {
		var message = (typeof error === 'string') ? error : ' Error saving image.'
		delete_image(req, res, image_path, false, redirect_uri, message)
	})
}

// Function to delete an image
function delete_image(req, res, image_path, success, redirect_uri, message) {
	image.destroy(image_path).then(function(val) {
		req.session.message = {text: message, type: (success) ? 'success' : 'danger' };
		res.redirect((success) ? redirect_uri :'/idm/applications/'+req.application.id); 
	}).catch(function(error) {
		req.session.message = {text: ' Error saving image.', type: 'danger'};
		res.redirect('/idm/applications/'+req.application.id);
	})
}

// Funtion to see if request is via AJAX or Browser and depending on this, send a request
function send_response(req, res, response, url) {
	if (req.xhr) {
		res.send(response);
	} else {
		if (response.message) {
			req.session.message = response.message	
		} else {
			req.session.message = response;
		}
		res.redirect(url);
	}
}
var models = require('../models/models.js');
var fs = require('fs');
var uuid = require('uuid');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var debug = require('debug')('idm:application_controller');

var gravatar = require('gravatar');

var magic = new Magic(mmm.MAGIC_MIME_TYPE);

// Autoload info if path include applicationId
exports.load_application = function(req, res, next, applicationId) {

	debug("--> load_application");

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

// GET /idm/applications -- List all applications
exports.index = function(req, res) {

	debug("--> index");

	// Search applications in which the user is authorized
	models.role_user.findAll({
		where: { user_id: req.session.user.id },
		include: [{
			model: models.oauth_client,
			attributes: ['id', 'name', 'url', 'image']
		}]
	}).then(function(user_applications) {
		// Set message to send when rendering view and delete from request
		if (req.session.message) {
			res.locals.message = req.session.message;
			delete req.session.message
		}

		var applications = []
		// If user has applications, set image from file system and obtain info from each application
		if (user_applications.length > 0) {
			
			user_applications.forEach(function(app) {
				if (applications.length == 0 || !applications.some(elem => (elem.id == app.OauthClient.id))) {
					if (app.OauthClient.image == 'default') {
						app.OauthClient.image = '/img/logos/medium/app.png'
					} else {
						app.OauthClient.image = '/img/applications/'+app.OauthClient.image
					}
					applications.push(app.OauthClient)
				} 
			});

			// Order applications and render view
			applications.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} )
		}

		res.render('applications/index', { applications: applications, errors: []});
	}).catch(function(error) { next(error); });
};

// GET /idm/applications/:applicationId -- Show info about an application
exports.show = function(req, res, next) {

	debug("--> show");

	// Search info about the users authorized in the application
	models.role_user.findAll({
		where: { oauth_client_id: req.application.id },
		include: [{
			model: models.user,
			attributes: ['id', 'username', 'email', 'image', 'gravatar']
		}]
	}).then(function(users_application) {
		// Array of users authorized in the application
		var users_authorized = []
		// Array of roles owned by the user logged
		var user_logged_roles = []

		users_application.forEach(function(app) {
			if(app.User.id === req.session.user.id) {
				user_logged_roles.push(app.role_id)
			}
			if(users_authorized.some(elem => elem.user_id === app.User.id) === false) {
				var image = '/img/logos/medium/user.png'
                if (app.User.gravatar) {
					image = gravatar.url(app.User.email, {s:36, r:'g', d: 'mm'}, {protocol: 'https'});
				} else if (app.User.image !== 'default') {
                    image = '/img/users/' + app.User.image
                }
				users_authorized.push({ user_id: app.User.id, 
										username: app.User.username,
										image: image });
			} 
		});

		// Search permissions using the roles of the user logged			
		models.role_permission.findAll({
			where: { role_id: user_logged_roles },
			attributes: ['permission_id'],
		}).then(function(user_logged_permissions) {
			if(user_logged_permissions.length > 0) {
				// Set message to send when rendering view and delete from request
				if (req.session.message) {
					res.locals.message = req.session.message;
					delete req.session.message
				}

				// Search iot sensors of application
				models.iot.findAll({
					where: { oauth_client_id: req.application.id },
					attributes: ['id'],
				}).then(function(iot_sensors) {

					// Search pep proxy of application
					models.pep_proxy.findOne({
						where: { oauth_client_id: req.application.id },
						attributes: ['id'],
					}).then(function(pep_proxy) {
						if (req.session.pep) {
							pep_proxy = req.session.pep;
							delete req.session.pep
						}
						res.render('applications/show', { application: req.application, 
														  users_authorized: users_authorized, 
														  user_logged_permissions: user_logged_permissions,
														  pep_proxy: pep_proxy,
														  iot_sensors: iot_sensors,																	  
														  errors: [] });

					}).catch(function(error) { next(error); });
				}).catch(function(error) { next(error); });

			} else { res.render('applications/show', { 	application: req.application, 
														users_authorized: users_authorized, 
														user_logged_permissions: [],
														pep_proxy: undefined,
														iot_sensors: [],																	  
														errors: [] }); }
		}).catch(function(error) { next(error); });
	}).catch(function(error) { next(error); });
	
};

// GET /idm/applications/new -- Render a view to create a new application
exports.new = function(req, res) {

	debug("--> new");

	res.render('applications/new', {application: {}, errors: []})
};
	
// POST /idm/applications -- Create application
exports.create = function(req, res, next) {

	debug("--> create");

	// If body has parameters id or secret don't create application
	if (req.body.id || req.body.secret) {
		req.session.message = {text: ' Application creation failed.', type: 'danger'};
		res.redirect('/idm/applications')
	} else {
		// Build a row and validate if input values are correct (not empty) before saving values in oauth_client
		var application = models.oauth_client.build(req.body.application);
		application.validate().then(function(err) {
			application.save({fields: [ 'id', 
										'name', 
										'description', 
										'url', 
										'redirect_uri', 
										'secret', 
										'image']
			}).then(function(){
				// Assign by default the provider role to the user who is creating the application
        		models.role_user.create({ oauth_client_id: application.id, 
        								  role_id: 'provider', 
        								  user_id: req.session.user.id}
        		).then(function(newAssociation) {
					res.redirect('/idm/applications/'+application.id+'/step/avatar');
				})
			}).catch(function(error){
				res.locals.message = {text: ' Unable to create application',type: 'danger'}
			 	res.render('applications/new', { application: application, errors: []});
			});	

		// Render the view once again, sending the error found when validating
		}).catch(function(error){ 
		 	res.render('applications/new', { application: application, errors: error.errors}); 
		});
	}	
};

// GET /idm/applications/:applicationId/step/avatar -- Form to create avatar when creating an application
exports.step_new_avatar = function(req, res, next) {

	debug("--> step_new_avatar");

	res.render('applications/step_create_avatar', { application: req.application, errors: []});
};

// POST /idm/applications/:applicationId/step/avatar -- Create Avatar when creating an application
exports.step_create_avatar = function(req, res, next) {

	debug("--> step_create_avatar");

	// See if the user has selected a image to upload
	if (req.file) {

		// Check the MIME of the file upload
		var types = ['jpg', 'jpeg', 'png']
		magic.detectFile('public/img/applications/'+req.file.filename, function(err, result) {
			if (err) {
                req.session.message = {text: ' Image not save.', type: 'warning'};
                return res.redirect('/idm/applications/'+req.application.id);
            }

			if (result && types.includes(String(result.split('/')[1]))) {
				// If the file is jpg, png or jpeg, update the application with the name of the image
				models.oauth_client.update(
					{ image: req.file.filename },
					{
						fields: ["image"],
						where: {id: req.application.id }
					}
				).then(function(){
					req.application.image = '/img/applications/'+req.file.filename
					res.redirect('/idm/applications/'+req.application.id+'/step/roles');
				}).catch(function(error) {
					res.send('error')
				});
			} else {
				// If not, delete the image 
				fs.unlink('./public/img/applications/'+req.file.filename, (err) => {
					req.session.message = {text: ' Inavalid file.', type: 'danger'};
					res.redirect('/idm/applications/'+req.application.id);            
				});
			}	
		});

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
																		      role_permission_assign: role_permission_assign }});
			}).catch(function(error) { next(error); });
		}).catch(function(error) { next(error); });
	}).catch(function(error) { next(error); });
};

// GET /idm/applications/:applicationId/edit -- View to edit application
exports.edit = function(req, res) {
	
	debug("--> edit");
	
	res.render('applications/edit', { application: req.application, errors: []});
};

// PUT /idm/applications/:applicationId/edit/avatar -- Update application avatar
exports.update_avatar = function(req, res) {

	debug("--> update_avatar");

	// See if the user has selected a image to upload
	if (req.file) {

		// Check the MIME of the file upload
		var types = ['jpg', 'jpeg', 'png']
		magic.detectFile('public/img/applications/'+req.file.filename, function(err, result) {
			if (err) {
                req.session.message = {text: ' Image not save.', type: 'warning'};
                return res.redirect('/idm/applications/'+req.application.id);
            }

			if (result && types.includes(String(result.split('/')[1]))) {
				// If the file is jpg, png or jpeg, update the application with the name of the image

					models.oauth_client.update(
						{ image: req.file.filename },
						{
							fields: ['image'],
							where: {id: req.application.id}
						}
					).then(function() {
						// Send message of success when updating image 
						req.session.message = {text: ' Application updated successfully.', type: 'success'};
						res.redirect('/idm/applications/'+req.application.id);
					}).catch(function(error){ 
						// Send message of fail when updating image
						res.locals.message = {text: ' Application update failed.', type: 'warning'};
					 	res.render('applications/edit', { application: req.body.application, errors: error.errors});
					});	
			// If not, the default image is assigned to the application
			} else {
				fs.unlink('./public/img/applications/'+req.file.filename, (err) => {
					req.session.message = {text: ' Inavalid file.', type: 'danger'};
					res.redirect('/idm/applications/'+req.application.id);            
				});
			}
	  	});

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
				  description: req.body.application.description,
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
			 	res.render('applications/edit', { application: application, errors: []});
			});		
		}).catch(function(error){
			// Send message of warning of updating the application
			res.locals.message = {text: ' Application update failed.', type: 'warning'};
		 	res.render('applications/edit', { application: req.body.application, errors: error.errors});
		});
	}
};

// DELETE /idm/applications/:applicationId/edit/delete_avatar -- Delete avatar
exports.delete_avatar = function(req, res) {

	debug("--> delete_avatar");

	// Delete image from filesystem
	var image_name = req.application.image.split('/')[3]
	fs.unlink('./public/img/applications/'+image_name, (err) => {
        if (err) {
        	// Send message of fail when deleting image
            res.send({text: ' Failed to delete image.', type: 'warning'});
        } else {
        	// Change image to default one in oauth_client table
			models.oauth_client.update(
				{ image: 'default' },
				{
					fields: ["image"],
					where: {id: req.application.id }
				}
			).then(function(deleted){
				if (deleted[0] === 1) {
					// Send message of success in deleting image
		        	req.application.image = '/img/logos/original/app.png'
		            res.send({text: ' Deleted image.', type: 'success'});
				} else {
					// Send message of fail when deleting an image
		            res.send({text: ' Failed to delete image.', type: 'danger'});
				}
	        }).catch(function(error) {
				// Send message of fail when deleting image
				res.send({text: ' Failed to delete image.', type: 'danger'});
			});                                   
        }
	});
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
var models = require('../models/models.js');

// Autoload info if path include applicationid
exports.load = function(req, res, next, applicationId) {
	if (!("application" in req.session) || req.session.application.id != applicationId) {
		models.oauth_client.findById(applicationId).then(function(application) {
			if (application) {
				req.session.application = application
				models.role.findAll({
					where: { oauth_client_id: req.session.application.id },
				}).then(function(roles) {
					if (roles) {						
						req.session.application_roles = roles;
						models.role_user.findAll({
							where: { oauth_client_id: req.session.application.id },
							include: [{
								model: models.user,
								attributes: ['id', 'username']
							}]
						}).then(function(users_application) {
							if (users_application) {
								var users_authorized = []
								users_application.forEach(function(app) {
										users_authorized.push({ user_id: app.User.id, 
																role_id: app.role_id, 
																username: app.User.username});
								});
								req.session.application_users_authorized = users_authorized;
								next();
							} else { next(new Error("No existe la aplicacion con id = " + applicationId));}
						}).catch(function(error) { next(error); });
					} else { next(new Error("No existe la aplicacion con id = " + applicationId));}
				}).catch(function(error) { next(error); });
			} else { next(new Error("No existe la aplicacion con id = " + applicationId));}
		}).catch(function(error) { next(error); });
	} else {
		next();
	}
};

// Form for new application
exports.new = function(req, res) {
	res.render('applications/new', {application: {}, errors: []})
};
	
// Create new application
exports.create = function(req, res, next) {
	var application = models.oauth_client.build(req.body.application);
	application.validate().then(function(err) {
		////// CAMBIAR EL ROLE ID CREADO EN ROLE_USER PARA CUANDO SE CREA UNA APLICACION SE CREEN ROLES AUTOMATICAMENTE
		application.save({fields: ["id", "name", "description", "url", "redirect_uri", "secret"]}).then(function() {
			models.role_user.create({ oauth_client_id: application.id, role_id: "5b040984-8356-444e-99cc-c475e4ea9da6", user_id: req.session.user.id}).then(function(newAssociation) {
				res.redirect('/idm/applications/'+application.id+'/step/avatar');
			}).catch(function(error){
			 	res.render('applications/new', { application: application, errors: error.errors}); 
			});	
		});	
	}).catch(function(error){ 
	 	res.render('applications/new', { application: application, errors: error.errors}); 
	});	
};

// Form to create avatar when creating an application
exports.step_new_avatar = function(req, res, next) {
	res.render('applications/create_avatar', { application: req.session.application, errors: error.errors});
};

// CreateAvatar when creating an application
exports.step_create_avatar = function(req, res, next) {
	res.redirect('/idm/applications/'+application.id+'/step/roles');
};

// Form to assign roles when creating an application
exports.step_new_roles = function(req, res, next) {
};

// Assign roles when creating an application
exports.step_create_roles = function(req, res, next) {
};


// List all applications
exports.index = function(req, res) {
	models.role_user.findAll({
		where: { user_id: req.session.user.id },
		include: [{
			model: models.oauth_client,
			attributes: ["id", "name", "url"]
		}]
	}).then(function(user_applications) {
		if (user_applications) {
			var applications = []
			user_applications.forEach(function(app) {
				if (applications.length == 0 || !applications.some(elem => (elem.id == app.OauthClient.id))) {
					applications.push(app.OauthClient)
				} 
			});

			if (req.session.message) {
				res.locals.message = req.session.message;
				delete req.session.message
			}
			res.render('applications/index', { applications: applications, errors: []});
		}
	});
};

// Show info about an application
exports.show = function(req, res) {
	if (req.session.message) {
		res.locals.message = req.session.message;
		delete req.session.message
	}
	res.render('applications/show', { application: req.session.application, 
									  users_authorized: req.session.application_users_authorized, 
									  roles: req.session.application_roles,
									  errors: [] });
};

// Edit application
exports.edit = function(req, res) {
  res.render('applications/edit', { application: req.session.application, errors: []});
};

// Update application
exports.update = function(req, res) {
	console.log(req.body.application)
	req.body.application["id"] = req.session.application.id
	var application = models.oauth_client.build(req.body.application);
	application.validate().then(function(err) {
		models.oauth_client.update(
			{ name: req.body.application.name,
			  description: req.body.application.description,
			  url: req.body.application.url,
			  redirect_uri: req.body.application.redirect_uri, },
			{
				fields: ["name","description","url","redirect_uri"],
				where: {id: req.session.application.id}
			}
		).then(function() {
			req.session.application.name = req.body.application.name;
			req.session.application.description = req.body.application.description;
			req.session.application.url = req.body.application.url;
			req.session.application.redirect_uri = req.body.application.redirect_uri;
			req.session.message = {text: ' Application updated successfully.', type: 'success'};
			res.redirect("/idm/applications/"+req.session.application.id);
		});	
	}).catch(function(error){ 
		res.locals.message = {text: ' Application update failed.', type: 'warning'};
	 	res.render('applications/edit', { application: req.body.application, errors: error.errors});
	});
};

// Show roles and permissions
exports.manage_roles = function(req, res, next) {

	models.role_permission.findAll({
		where: { oauth_client_id: req.session.application.id }
	}).then(function(application_roles) {
		if (application_roles) {
			role_permission_assign = {}
			for (var i = 0; i < application_roles.length; i++) {
				if (!role_permission_assign[application_roles[i].role_id]) {
			        role_permission_assign[application_roles[i].role_id] = [];
			    }
			    role_permission_assign[application_roles[i].role_id].push(application_roles[i].permission_id);
			}
			models.permission.findAll({
				where: { oauth_client_id: req.session.application.id }
			}).then(function(permissions) {
				if (permissions) {
					res.render('applications/manage_roles', { application: { id: req.session.application.id, 
																			 roles: req.session.application_roles, 
																			 permissions: permissions,
																			 role_permission_assign: role_permission_assign }});
				}
			}).catch(function(error) { next(error); });
		} else { next(new Error("No existe la aplicacion con id = " + applicationId));}
	}).catch(function(error) { next(error); });
}

// Create new roles
exports.create_roles = function(req, res) {

	var role = models.role.build({ name: req.body.name, 
								   oauth_client_id: req.session.application.id });

	role.validate().then(function(err) {
		role.save({fields: ["id", "name", "oauth_client_id"]}).then(function() {
			req.session.application_roles.push({id: role.id, name: role.name})
			res.send(role);
		})
	}).catch(function(error) {
		res.send(error.errors);
	});
}

// Edit role
exports.edit_roles = function(req, res) {
	var role_name = req.body.role_name;
	var role_id = req.body.role_id;

	var role = models.role.build({ name: role_name, 
								   oauth_client_id: req.session.application.id });

	role.validate().then(function(err) {
		models.role.update(
			{ name: role_name },
			{
				fields: ["name"],
				where: {id: role_id}
			}
		).then(function(){
			var index = req.session.application_roles.findIndex(elem => elem.id === role_id); 
	        if (index > -1) {
	        	req.session.application_roles[index].name = role_name;        	
	        }	
			res.send({text: ' Role was successfully edited.', type: 'success'});
		}).catch(function(error) {
			res.send({text: ' Error while editing role.', type: 'warning'})
		});
	}).catch(function(error) {
		res.send(error.errors[0].message)
	});
}

// Delete role
exports.delete_roles = function(req, res) {

	models.role.destroy({
	where: { id: req.body.role_id,
			 oauth_client_id: req.body.app_id 
			}
	}).then(function() {
		var index = req.session.application_roles.findIndex(elem => elem.id === req.body.role_id); 
        if (index > -1) {
        	req.session.application_roles.splice(index, 1);        	
        }
		res.send({text: ' Role was successfully deleted.', type: 'success'});
	}).catch(function(error) {
		res.send({text: ' Error while deleting role.', type: 'warning'});
	});	
}

// Create new permissions
exports.create_permissions = function(req, res) {

	var permission = models.permission.build({ name: req.body.name,
										 description: req.body.description,
										 action: req.body.action,
										 resource: req.body.resource,
										 xml: req.body.xml, 
										 oauth_client_id: req.session.application.id });

	permission.validate().then(function(err) {
		permission.save({fields: ["id", "name", "description", "action", "resource", "xml", "oauth_client_id"]}).then(function() {
			res.send(permission);
		})
	}).catch(function(error) {
		res.send(error.errors);
	});
}

// Assing permissions to roles 
exports.role_permissions_assign = function(req, res) {
	models.role_permission.destroy({
		where: { oauth_client_id: req.session.application.id }
	}).then(function() {
		submit_assignment = JSON.parse(req.body.submit_assignment); 

		create_assign_roles_permissions = []
		for(var role in submit_assignment) {
			for (var permission = 0; permission < submit_assignment[role].length; permission++) {
				create_assign_roles_permissions.push({role_id: role, permission_id: submit_assignment[role][permission], oauth_client_id: req.session.application.id})
			}
		}

		models.role_permission.bulkCreate(create_assign_roles_permissions).then(function() {
			req.session.message = {text: ' Modified roles and permissions.', type: 'success'};
			res.redirect("/idm/applications/"+req.session.application.id)
		}).catch(function(error) {
			req.session.message = {text: ' Roles and permissions assignment error.', type: 'warning'};
			res.redirect("/idm/applications/"+req.session.application.id)
		});
	}).catch(function(error) {
		req.session.message = {text: ' Roles and permissions assignment error.', type: 'warning'};
		res.redirect("/idm/applications/"+req.session.application.id)
	});
}

// Delete application
exports.destroy = function(req, res) {

	models.oauth_client.destroy({
		where: { id: req.session.application.id }
	}).then(function() {
		models.role_user.findAll({
			where: { user_id: req.session.user.id },
			include: [models.oauth_client]
		}).then(function(user_applications) {
			if (user_applications) {
				var applications = [];
				for (i = 0; i < user_applications.length; i++) {
					applications.push(user_applications[i].OauthClient);	
				}
				res.locals.message = {text: ' Application deleted.', type: 'success'};
				res.render('applications/index', { applications: applications, errors: []});
			}
		});
	}).catch(function(error) {
		req.session.message = {text: ' Application delete error.', type: 'warning'};
		res.redirect('/idm/applications');
	});
};


// Authorize users in an application
exports.available_users = function(req, res) {

	var key = req.body.username
	models.user.findAll({
	 	attributes: ['username', 'id'],
		where: {
            username: {
                like: '%' + key + '%'
            }
        }
	}).then(function(users) {
		if (users.length > 0) {
			res.send(users)
		} else {
			res.send('no_users_found')
		}
	});

}

// Authorize users in an application
exports.authorize_users = function(req, res) {

	models.role_user.destroy({
		where: { oauth_client_id: req.session.application.id }
	}).then(function() {
		var submit_authorize_users = req.body.submit_authorize; 
		req.session.application_users_authorized = JSON.parse(JSON.stringify(submit_authorize_users))

		for (var i = 0; i < submit_authorize_users.length; i++) {
			submit_authorize_users[i].oauth_client_id = req.session.application.id;
			delete submit_authorize_users[i].username
		}

		models.role_user.bulkCreate(submit_authorize_users).then(function() {
			res.send({text: ' Modified users authorization.', type: 'success'})
		}).catch(function(error) {
			res.send({text: ' Modified users authorization error.', type: 'warning'})
		});

	}).catch(function(error) {
		res.send({text: ' Modified users authorization error.', type: 'warning'})
	});
}


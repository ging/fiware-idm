var models = require('../models/models.js');
var fs = require('fs');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var magic = new Magic(mmm.MAGIC_MIME_TYPE);

exports.owned_permissions = function(req, res, next) {
	models.role_user.findAll({
		where: { user_id: req.session.user.id, 
				 oauth_client_id: req.application.id }
	}).then(function(user_application) {
		if (user_application) {
			var user_roles = []
			user_application.forEach(function(app) {
				user_roles.push(app.role_id)
			});
			models.role_permission.findAll({
				where: { role_id: user_roles },
				attributes: ['permission_id'],
			}).then(function(user_permissions) {
				if(user_permissions) {
					var user_permissions_id = []
					user_permissions.forEach(function(app) {
						user_permissions_id.push(app.permission_id)
					});
					check_user_action(req.application, req.path, req.method, user_permissions_id)
					next();
				} else { next(new Error("The applications hasn't got users authorized"));}
			}).catch(function(error) { next(error); });
		} else { next(new Error("The applications hasn't got users authorized"));}
	}).catch(function(error) { next(error); });
}

// Autoload info if path include applicationid
exports.load = function(req, res, next, applicationId) {
	models.oauth_client.findById(applicationId).then(function(application) {
		if (application) {
			req.application = application
			if (application.image == 'default') {
				req.application.image = '/img/logos/original/app.png'
			} else {
				req.application.image = '/img/applications/'+application.image
			}
			next();
		} else { next(new Error("The application with id " + applicationId + "doesn't exist"));}
	}).catch(function(error) { next(error); });
};

// List all applications
exports.index = function(req, res) {
	models.role_user.findAll({
		where: { user_id: req.session.user.id },
		include: [{
			model: models.oauth_client,
			attributes: ['id', 'name', 'url', 'image']
		}]
	}).then(function(user_applications) {
		if (user_applications) {
			var applications = []
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

			if (req.session.message) {
				res.locals.message = req.session.message;
				delete req.session.message
			}
			// Order applications
			applications.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} )

			res.render('applications/index', { applications: applications, errors: []});
		}
	});
};

// Show info about an application
exports.show = function(req, res, next) {
	models.role_user.findAll({
		where: { oauth_client_id: req.application.id },
		include: [{
			model: models.user,
			attributes: ['id', 'username']
		}]
	}).then(function(users_application) {
		if (users_application) {
			var users_authorized = []
			var user_logged_roles = []
			users_application.forEach(function(app) {
				if(app.User.id === req.session.user.id) {
					user_logged_roles.push(app.role_id)
				}
				if(users_authorized.some(elem => elem.user_id === app.User.id) === false) {
					users_authorized.push({ user_id: app.User.id, 
											role_id: app.role_id, 
											username: app.User.username});
				} 
			});
			models.role_permission.findAll({
				where: { role_id: user_logged_roles },
				attributes: ['permission_id'],
			}).then(function(user_logged_permissions) {
				if(user_logged_permissions) {
					if (req.session.message) {
						res.locals.message = req.session.message;
						delete req.session.message
					}
					res.render('applications/show', { application: req.application, 
													  users_authorized: users_authorized, 
													  user_logged_permissions: user_logged_permissions,
													  errors: [] });
				} else { next(new Error("The applications hasn't got users authorized"));}
			}).catch(function(error) { next(error); });
		} else { next(new Error("The applications hasn't got users authorized"));}
	}).catch(function(error) { next(error); });
	
};

// Form for new application
exports.new = function(req, res) {
	res.render('applications/new', {application: {}, errors: []})
};
	
// Create new application
exports.create = function(req, res, next) {
	if (req.body.id || req.body.secret) {
		req.session.message = {text: ' Application creation failed.', type: 'danger'};
		res.redirect('/idm/applications')
	} else {
		var application = models.oauth_client.build(req.body.application);
		application.validate().then(function(err) {
			application.save({fields: ['id', 'name', 'description', 'url', 'redirect_uri', 'secret', 'image']}).then(function(){
            	models.role.findOne({ where: { id: 'provider', oauth_client_id: 'idm_admin_app' } }).then(function(role) {
            		models.role_user.create({ oauth_client_id: application.id, role_id: role.id, user_id: req.session.user.id}).then(function(newAssociation) {
						res.redirect('/idm/applications/'+application.id+'/step/avatar');
					}).catch(function(error) {
			 			res.render('applications/new', { application: application, errors: error.errors}); 
					});	
            	})
			}).catch(function(error) {
				res.render('applications/new', { application: application, errors: error.errors});
			});
		}).catch(function(error){ 
		 	res.render('applications/new', { application: application, errors: error.errors}); 
		});
	}	
};

// Form to create avatar when creating an application
exports.step_new_avatar = function(req, res, next) {
	res.render('applications/step_create_avatar', { application: req.application, errors: []});
};

// Create Avatar when creating an application
exports.step_create_avatar = function(req, res, next) {

	if (req.file) {
		var types = ['jpg', 'jpeg', 'png']
		magic.detectFile('public/img/applications/'+req.file.filename, function(err, result) {
			if (types.includes(String(result.split('/')[1]))) {
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
				fs.unlink('./public/img/applications/'+req.file.filename, (err) => {
					req.session.message = {text: ' Inavalid file.', type: 'danger'};
					res.redirect('/idm/applications/'+req.application.id);            
				});
			}	
		});
	} else {
		req.application.image = '/img/logos/original/app.png'
		res.redirect('/idm/applications/'+req.application.id+'/step/roles');
	}
};

// Form to assign roles when creating an application
exports.step_new_roles = function(req, res, next) {

	models.role.findAll({
		where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
		attributes: ['id', 'name'],
		order: [['id', 'DESC']]
	}).then(function(roles) {
		if (roles) {
			models.permission.findAll({
				where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
				attributes: ['id', 'name'], 
				order: [['id', 'ASC']]
			}).then(function(permissions) {
				if (permissions) {
					models.role_permission.findAll({
						where: { role_id: roles.map(elem => elem.id) }						
					}).then(function(application_roles_permissions) {
						if (application_roles_permissions) {
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
						}
					}).catch(function(error) { next(error); });
				}
			}).catch(function(error) { next(error); });
		} else { next(new Error("Problems when searching roles"));}
	}).catch(function(error) { next(error); });
};

// Edit application
exports.edit = function(req, res) {
  res.render('applications/edit', { application: req.application, errors: []});
};

// Update application avatar
exports.update_avatar = function(req, res) {

	var types = ['jpg', 'jpeg', 'png']
	if (req.file) {
		req.body.application = JSON.parse(JSON.stringify(req.application))
		req.body.application['image'] = req.file.filename

		magic.detectFile('public/img/applications/'+req.file.filename, function(err, result) {

			if (err) throw err;

			if (types.includes(String(result.split('/')[1]))) {
				req.body.application["id"] = req.application.id
				var application = models.oauth_client.build(req.body.application);

					models.oauth_client.update(
						{ image: req.body.application.image },
						{
							fields: ['image'],
							where: {id: req.application.id}
						}
					).then(function() {
						req.application.image = '/img/applications/'+req.body.application.image
						req.session.message = {text: ' Application updated successfully.', type: 'success'};
						res.redirect('/idm/applications/'+req.application.id);
					}).catch(function(error){ 
						res.locals.message = {text: ' Application update failed.', type: 'warning'};
					 	res.render('applications/edit', { application: req.body.application, errors: error.errors});
					});	
			} else {
				fs.unlink('./public/img/applications/'+req.file.filename, (err) => {
					req.session.message = {text: ' Inavalid file.', type: 'danger'};
					res.redirect('/idm/applications/'+req.application.id);            
				});
			}
	  	});
  	} 
};

// Update application information
exports.update_info = function(req, res) {

	if (req.body.id || req.body.secret) {
		res.locals.message = {text: ' Application edit failed.', type: 'danger'};
		res.redirect('/idm/applications/'+req.application.id)
	} else {

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
				req.application.name = req.body.application.name;
				req.application.description = req.body.application.description;
				req.application.url = req.body.application.url;
				req.application.redirect_uri = req.body.application.redirect_uri;
				req.session.message = {text: ' Application updated successfully.', type: 'success'};
				res.redirect('/idm/applications/'+req.application.id);
			});	
		}).catch(function(error){ 
			res.locals.message = {text: ' Application update failed.', type: 'warning'};
		 	res.render('applications/edit', { application: req.body.application, errors: error.errors});
		});
	}
};

// Show roles and permissions
exports.manage_roles = function(req, res, next) {

	models.role.findAll({
		where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
		attributes: ['id', 'name'],
		order: [['id', 'DESC']]
	}).then(function(roles) {
		if (roles) {
			models.permission.findAll({
				where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
				attributes: ['id', 'name'], 
				order: [['id', 'ASC']]
			}).then(function(permissions) {
				if (permissions) {
					models.role_permission.findAll({
						where: { role_id: roles.map(elem => elem.id) }						
					}).then(function(application_roles_permissions) {
						if (application_roles_permissions) {
							role_permission_assign = {}
							for (var i = 0; i < application_roles_permissions.length; i++) {
								if (!role_permission_assign[application_roles_permissions[i].role_id]) {
							        role_permission_assign[application_roles_permissions[i].role_id] = [];
							    }
							    role_permission_assign[application_roles_permissions[i].role_id].push(application_roles_permissions[i].permission_id);
							}
							res.render('applications/manage_roles', { application: { id: req.application.id, 
																					 roles: roles, 
																					 permissions: permissions,
																					 role_permission_assign: role_permission_assign }});
						}
					}).catch(function(error) { next(error); });
				}
			}).catch(function(error) { next(error); });
		} else { next(new Error("Problems when searching roles"));}
	}).catch(function(error) { next(error); });

}

// Create new roles
exports.create_role = function(req, res) {

	if (req.body.id || req.body.is_internal) {
		res.send({text: ' Failed creating role', type: 'danger'});
	} else {

		var role = models.role.build({ name: req.body.name, 
								   oauth_client_id: req.application.id });

		role.validate().then(function(err) {
			role.save({fields: ["id", "name", "oauth_client_id"]}).then(function() {
				var message = {text: ' Create role', type: 'success'}
				res.send({role: role, message: message});
			})
		}).catch(function(error) {
			res.send({text: error.errors[0].message, type: 'warning'});			
		});
	}
}

// Edit role
exports.edit_role = function(req, res) {
	var role_name = req.body.role_name;
	var role_id = req.body.role_id;

	if (['provider', 'purchaser'].includes(role_id) || req.body.is_internal) {
		res.send({text: ' Failed editing role', type: 'danger'});
	
	} else {

		var role = models.role.build({ name: role_name, 
									   oauth_client_id: req.application.id });

		role.validate().then(function(err) {
			models.role.update(
				{ name: role_name },
				{
					fields: ["name"],
					where: {id: role_id}
				}
			).then(function(){
				res.send({text: ' Role was successfully edited.', type: 'success'});
			}).catch(function(error) {
				res.send({text: ' Failed editing role.', type: 'danger'})
			});
		}).catch(function(error) {
			res.send({text: error.errors[0].message, type: 'warning'})
		});
	}
}

// Delete role
exports.delete_role = function(req, res) {

	if (['provider', 'purchaser'].includes(req.body.role_id) || req.body.is_internal) {
		res.send({text: ' Failed deleting role', type: 'danger'});
	
	} else {

		models.role.destroy({
		where: { id: req.body.role_id,
				 oauth_client_id: req.body.app_id 
				}
		}).then(function() {
			res.send({text: ' Role was successfully deleted.', type: 'success'});
		}).catch(function(error) {
			res.send({text: ' Failed deleting role', type: 'danger'});
		});	
	}
}

// Create new permissions
exports.create_permission = function(req, res) {

	if (req.body.id || req.body.is_internal) {
		res.send({text: ' Failed creating permission', type: 'danger'});
	} else {
		var permission = models.permission.build({ name: req.body.name,
											 description: req.body.description,
											 action: req.body.action,
											 resource: req.body.resource,
											 xml: req.body.xml, 
											 oauth_client_id: req.application.id });

		permission.validate().then(function(err) {
			permission.save({fields: ["id", "name", "description", "action", "resource", "xml", "oauth_client_id"]}).then(function() {
				var message = {text: ' Create permission', type: 'success'}
				res.send({permission: permission, message: message});
			})
		}).catch(function(error) {
			res.send({text: error.errors, type: 'warning'});
		});
	}
}

// Assing permissions to roles 
exports.role_permissions_assign = function(req, res) {
	
	var roles_id = Object.keys(JSON.parse(req.body.submit_assignment))
	var public_roles_id = roles_id.filter(elem => !['provider','purchaser'].includes(elem))

	models.role_permission.destroy({
		where: { 
			role_id: public_roles_id
		}
	}).then(function() {
		var submit_assignment = JSON.parse(req.body.submit_assignment);
		create_assign_roles_permissions = []
		for(var role in submit_assignment) {
			if (!['provider', 'purchaser'].includes(role)) {
				for (var permission = 0; permission < submit_assignment[role].length; permission++) {
					create_assign_roles_permissions.push({role_id: role, permission_id: submit_assignment[role][permission], oauth_client_id: req.application.id})
				}
			}
		}

		models.role_permission.bulkCreate(create_assign_roles_permissions).then(function() {
			req.session.message = {text: ' Modified roles and permissions.', type: 'success'};
			res.redirect("/idm/applications/"+req.application.id)
		}).catch(function(error) {
			req.session.message = {text: ' Roles and permissions assignment error.', type: 'warning'};
			res.redirect("/idm/applications/"+req.application.id)
		});
	}).catch(function(error) {
		req.session.message = {text: ' Roles and permissions assignment error.', type: 'warning'};
		res.redirect("/idm/applications/"+req.application.id)
	});
}

// Delete avatar
exports.delete_avatar = function(req, res) {
	if (!req.body.image_name.includes('/img/applications')) {
		res.send({text: ' Cannot delete default image.', type: 'danger'});
	} else {
		models.oauth_client.update(
			{ image: 'default' },
			{
				fields: ["image"],
				where: {id: req.application.id }
			}
		).then(function(){
			var image_name = req.body.image_name.split('/')[3]
			fs.unlink('./public/img/applications/'+image_name, (err) => {
		        if (err) {
		            res.send({text: ' Failed to delete image.', type: 'warning'});
		        } else {
		        	req.application.image = '/img/logos/original/app.png'
		            res.send({text: ' Deleted image.', type: 'success'});                               
		        }
			});
		}).catch(function(error) {
			res.send('error')
		});
	}
};

// Delete application
exports.destroy = function(req, res) {
	if (req.application.image.includes('/img/applications')) {
		var image_name = req.application.image.split('/')[3]
		fs.unlink('./public/img/applications/'+image_name);
	}
	models.oauth_client.destroy({
		where: { id: req.application.id }
	}).then(function() {
		req.session.message = {text: ' Application deleted.', type: 'success'};
		res.redirect('/idm/applications')
	}).catch(function(error) {
		req.session.message = {text: ' Application delete error.', type: 'warning'};
		res.redirect('/idm/applications');
	});
};

// Authorize users in an application
exports.get_users = function(req, res, next) {
	models.role_user.findAll({
		where: { oauth_client_id: req.application.id },
		include: [{
			model: models.user,
			attributes: ['id', 'username']
		}]
	}).then(function(users_application) {
		if (users_application) {
			var users_authorized = []
			var user_logged_roles = []
			users_application.forEach(function(app) {
				if(app.User.id === req.session.user.id) {
					user_logged_roles.push(app.role_id)
				}
				users_authorized.push({ user_id: app.User.id, 
										role_id: app.role_id, 
										username: app.User.username});
			});
			models.role_permission.findAll({
				where: { role_id: user_logged_roles },
				attributes: ['permission_id'],
			}).then(function(user_logged_permissions) {
				if(user_logged_permissions) {
					user_logged_permissions_id = user_logged_permissions.map(elem => elem.permission_id) 
					var where_search_role = []
					if (user_logged_permissions_id.includes('6')) {
						where_search_role.push({id: user_logged_roles});
					}
					if (user_logged_permissions_id.includes('5')) {
						where_search_role.push({oauth_client_id: req.application.id})
					}

					if (user_logged_permissions_id.includes('1')) {
						where_search_role.push({is_internal: true});
					}
					models.role.findAll({
						where: { [Op.or]: where_search_role },
						attributes: ['id', 'name'],
						order: [['id', 'DESC']]
					}).then(function(roles) {
						if (roles) {
							res.send({ application: req.application, 
									   users_authorized: users_authorized, 
									   roles: roles,
									   errors: [] });
						} else { next(new Error("Error searching roles"));}
					}).catch(function(error) { 
						console.log(error)
						next(error); });
				} else { next(new Error("Error searching permissions and roles assignment"));}
			}).catch(function(error) { next(error); });
		} else { next(new Error("The applications hasn't got users authorized"));}
	}).catch(function(error) { next(error); });
}


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
exports.authorize_users = function(req, res, next) {

	models.role_user.findAll({
		where: { oauth_client_id: req.application.id },
		attributes: ['role_id', 'user_id', 'oauth_client_id']
	}).then(function(users_application_actual) {
		if (users_application_actual) {
			var users_to_be_authorized = JSON.parse(req.body.submit_authorize)
			users_to_be_authorized = users_to_be_authorized.filter(function(elem) {
	        	return (elem.role_id !== "")
	        });
			var new_authorization_users = authorize_all(users_application_actual, users_to_be_authorized)

			models.role_user.destroy({
				where: { user_id: new_authorization_users.delete_user }
			}).then(function() {
				models.role_user.destroy({
					where: { [Op.and]: [{user_id: new_authorization_users.delete_role_user.map(elem => elem.user_id)}, 
										{role_id: new_authorization_users.delete_role_user.map(elem => elem.role_id)}] }
				}).then(function() {

					var add_users_roles = new_authorization_users.add_role_user.concat(new_authorization_users.add_user)
					for (var i = 0; i < add_users_roles.length; i++) {
						add_users_roles[i].oauth_client_id = req.application.id;
					}

					models.role_user.bulkCreate(add_users_roles).then(function() {
						req.session.message = {text: ' Modified users authorization.', type: 'success'};
						res.redirect('/idm/applications/'+req.application.id)
					}).catch(function(error) {
						req.session.message = {text: ' Modified users authorization error.', type: 'warning'};
						res.redirect('/idm/applications/'+req.application.id)
					});
				}).catch(function(error) { next(error); });
			}).catch(function(error) { next(error); });
		} else { next(new Error("The applications hasn't got users authorized"));}
	}).catch(function(error) { next(error); });
}

// Method to see users permissions to do some actions
function check_user_action(application, path, method, permissions) {
	console.log("----------------------------------------------------------------------")
	console.log(path.split(application.id)[1])
	console.log("----------------------------------------------------------------------")
	console.log(method)
	console.log("----------------------------------------------------------------------")
	console.log(permissions)
	console.log("----------------------------------------------------------------------")
	var route = path.split(application.id)[1]
	console.log(route)
	console.log(route.includes('edit'))
	switch(true) {
	    case (route.includes('edit')):
	        console.log("--------edit--------")
	        break;
	    default:
	        console.log("--------default--------")
	}
}


// Method to see how add new rows to role_user database
function authorize_all(arr1, arr2) {

	// Change Array of objects, to object with key as user_id and value as an array of role_id
	var json_arr1 = {}
	for (var i = 0; i < arr1.length; i++) {
		if (!json_arr1[arr1[i].user_id]) {
	        json_arr1[arr1[i].user_id] = [];
	    }
	    json_arr1[arr1[i].user_id].push(arr1[i].role_id);
	}

	var json_arr2 = {}
	for (var i = 0; i < arr2.length; i++) {
		if (!json_arr2[arr2[i].user_id]) {
	        json_arr2[arr2[i].user_id] = [];
	    }
	    json_arr2[arr2[i].user_id].push(arr2[i].role_id);
	}

	// Search for roles to add or delete in users
	var add_role_user = {}
	var delete_role_user = {}
	for (var user_actual in json_arr1) {
		for (var users_to_authorized in json_arr2) {
			if (user_actual === users_to_authorized) {
				var del_rol = json_arr1[user_actual].filter(x => json_arr2[users_to_authorized].indexOf(x) == -1);
				delete_role_user[user_actual] = del_rol
				var add_rol = json_arr2[users_to_authorized].filter(x => json_arr1[user_actual].indexOf(x) == -1);
				add_role_user[user_actual] = add_rol
			}
		}	
	}

	// Users to be add or delete from database
	var delete_user =  Object.keys(json_arr1).filter(x => Object.keys(json_arr2).indexOf(x) == -1);
	var add_user = Object.keys(json_arr2).filter(x => Object.keys(json_arr1).indexOf(x) == -1);

	// Change results obtained to array of objects
	var add_role_user_defintive = []
	for (var user in add_role_user) {
		if (add_role_user[user].length <= 0) {
			delete add_role_user[user]
		} else {
			for (var i = 0; i < add_role_user[user].length; i++) {
				add_role_user_defintive.push({user_id: user, role_id: add_role_user[user][i]})
			}
		}
	}

	var delete_role_user_defintive = []
	for (var user in delete_role_user) {
		if (delete_role_user[user].length <= 0) {
			delete delete_role_user[user]
		} else {
			for (var i = 0; i < delete_role_user[user].length; i++) {
				delete_role_user_defintive.push({user_id: user, role_id: delete_role_user[user][i]})
			}
		}
	}

	var add_user_defintive = []
	for (var i = 0; i < add_user.length; i++) {
		for (var j = 0; j < json_arr2[add_user[i]].length; j++) {
			add_user_defintive.push({user_id: add_user[i], role_id: json_arr2[add_user[i]][j]})
		}
	}

	return { add_role_user: add_role_user_defintive, 
			 delete_role_user: delete_role_user_defintive, 
			 add_user: add_user_defintive, 
			 delete_user: delete_user }

}

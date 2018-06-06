var models = require('../../models/models.js');

// Authzforce module
var config_authzforce = require ('../../config.js').authorization;
var authzforce_controller = require('./authzforces');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var debug = require('debug')('idm:web-role_controller')

// Autoload info if path include roleId
exports.load_role = function(req, res, next, roleId) {

	debug("--> load_role");

	// Add id of pep proxy in request
	req.role = {id: roleId}
	next();
}

// GET /idm/applications/:applicationId/edit/roles -- Show roles and permissions
exports.manage_roles_view = function(req, res, next) {

	debug("--> manage_roles_view");

	res.render('applications/manage_roles', { application: req.application, authorization_level: config_authzforce.level, csrfToken: req.csrfToken() });
}

// GET /idm/applications/:applicationId/edit/roles/assignments -- Show roles and permissions
exports.manage_roles = function(req, res, next) {

	debug("--> manage_roles");

	var search_roles = models.role.findAll({
		where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
		attributes: ['id', 'name'],
		order: [['id', 'DESC']]
	})
	var search_permissions = models.permission.findAll({
		where: { [Op.or]: [{oauth_client_id: req.application.id}, {is_internal: true}] },
		attributes: ['id', 'name'], 
		order: [['id', 'ASC']]
	})
	var search_assignments = search_roles.then(function(roles) {
		return models.role_permission.findAll({
			where: { role_id: roles.map(elem => elem.id) }						
		})
	})

	Promise.all([search_roles, search_permissions, search_assignments]).then(function(values) {
		var roles = values[0]
		var permissions = values[1]
		var role_permission_assign = {}

		for (var i = 0; i < values[2].length; i++) {
			if (!role_permission_assign[values[2][i].role_id]) {
		        role_permission_assign[values[2][i].role_id] = [];
		    }
		    role_permission_assign[values[2][i].role_id].push(values[2][i].permission_id);
		}

		res.send({ application: {  id: req.application.id, 
								   roles: roles, 
								   permissions: permissions,
								   role_permission_assign: role_permission_assign }})

	}).catch(function(error) {
		// Send message of fail when creating role
		res.send({text: 'Error searching roles and permissions', type: 'danger'});
	})
}


// POST /idm/applications/:applicationId/edit/roles/create -- Create new role
exports.create_role = function(req, res) {

	debug("--> create_role");

	// If body has parameters id or is_internal don't create the role
	if (req.body.id || req.body.is_internal) {
		res.send({text: ' Failed creating role', type: 'danger'});
	} else {

		// Build a row and validate if input values are correct (not empty) before saving values in role table
		var role = models.role.build({ name: req.body.name, 
								   oauth_client_id: req.application.id });

		role.validate().then(function(err) {
			role.save({fields: ["id", "name", "oauth_client_id"]}).then(function() {
				// Send message of success of creating role
				var message = {text: ' Create role', type: 'success'}
				res.send({role: {id: role.id, name: role.name}, message: message});
			}).catch(function(error){
				res.send({text: ' Unable to create role',type: 'danger'})
			});
		}).catch(function(error) {
			// Send message of fail when creating role
			res.send({text: error.errors[0].message, type: 'warning'});			
		});
	}
}

// PUT /idm/applications/:applicationId/edit/roles/:roleId/edit -- Edit a role
exports.edit_role = function(req, res) {

	debug("--> edit_role");

	var role_name = req.body.role_name;

	// If body has parameter is_internal or role_id is provider or purchaser don't edit the role
	if (['provider', 'purchaser'].includes(req.role.id) || req.body.is_internal) {
		res.send({text: ' Failed editing role', type: 'danger'});
	
	} else {

		// Build a row and validate if input values are correct (not empty) before saving values in role table
		var role = models.role.build({ name: role_name, 
									   oauth_client_id: req.application.id });

		role.validate().then(function(err) {
			models.role.update(
				{ name: role_name },
				{
					fields: ["name"],
					where: {id: req.role.id,
							oauth_client_id: req.application.id }
				}
			).then(function(){
				// Send message of success of updating role
				res.send({text: ' Role was successfully edited.', type: 'success'});
			}).catch(function(error) {
				// Send message of fail when creating role
				res.send({text: ' Failed editing role.', type: 'danger'})
			});
		}).catch(function(error) {
			// Send message of fail when creating role (empty inputs)
			res.send({text: error.errors[0].message, type: 'warning'})
		});
	}
}

// DELETE /idm/applications/:applicationId/edit/roles/:roleId/delete -- Delete a role
exports.delete_role = function(req, res) {

	debug("--> delete_role");

	// If role is provider or purchaser don't delete the role
	if (['provider', 'purchaser'].includes(req.role.id)) {
		res.send({text: ' Failed deleting role', type: 'danger'});
	
	} else {
		// Destroy role
		models.role.destroy({
			where: { id: req.role.id,
					 oauth_client_id: req.application.id }
		}).then(function(deleted) {
			if (deleted) {
				// Send message of success of deleting role
				res.send({text: ' Role was successfully deleted.', type: 'success'});
			} else {
				// Send message of fail when deleting role
				res.send({text: ' Failed deleting role.', type: 'danger'});
			}
		}).catch(function(error) {
			// Send message of fail when deleting role
			res.send({text: ' Failed deleting role.', type: 'danger'});
		});
	}
}

// POST /idm/applications/:applicationId/edit/roles -- Assing permissions to roles 
exports.role_permissions_assign = function(req, res) {
	
	debug("--> role_permission_assign");

	var roles_id = Object.keys(JSON.parse(req.body.submit_assignment))

	// Filter req.body and obtain an array without roles provider and purchaser
	var public_roles_id = roles_id.filter(elem => !['provider','purchaser'].includes(elem))

	// If the array has elements destroy rows indicated on the array and create new ones
	if (public_roles_id.length > 0) {
		models.role_permission.destroy({
			where: { 
				role_id: public_roles_id
			}
		}).then(function() {
			var submit_assignment = JSON.parse(req.body.submit_assignment);
			// Array of objects with role_id, permission_id and oauth_client_id
			var create_assign_roles_permissions = []

			for(var role in submit_assignment) {
				if (!['provider', 'purchaser'].includes(role)) {
					for (var permission = 0; permission < submit_assignment[role].length; permission++) {
						create_assign_roles_permissions.push({	role_id: role, 
																permission_id: submit_assignment[role][permission], 
																oauth_client_id: req.application.id })
					}
				}
			}

			// Inset values into role_permission table
			models.role_permission.bulkCreate(create_assign_roles_permissions).then(function() {
				if (config_authzforce.authzforce.enabled) {
					authzforce_controller.submit_authzforce_policies(req, res, submit_assignment)
				} else {
					// Send message of success of assign permissions to roles
					req.session.message = {text: ' Modified roles and permissions.', type: 'success'};
					res.redirect("/idm/applications/"+req.application.id)					
				}
			}).catch(function(error) {
				debug('Error ' + error)
				// Send message of fail in assign permissions to roles
				req.session.message = {text: ' Roles and permissions assignment error.', type: 'warning'};
				res.redirect("/idm/applications/"+req.application.id)
			});
		}).catch(function(error) {
			debug('Error ' + error)
			// Send message of fail in assign permissions to roles
			req.session.message = {text: ' Roles and permissions assignment error.', type: 'warning'};
			res.redirect("/idm/applications/"+req.application.id)
		});
	} else {
		// Redirect to show application if there is no changes
		res.redirect("/idm/applications/"+req.application.id)
	}
}


var models = require('../models/models.js');
var gravatar = require('gravatar');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var debug = require('debug')('idm:authorize_user_controller')

// GET /idm/applications/:applicationId/edit/users -- Search users authorized
exports.get_users = function(req, res, next) {

	debug("--> get_users")

	// See if the request is via AJAX or browser
	if (req.xhr) {

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
				var image = '/img/logos/medium/user.png'
				if (app.User.gravatar) {
					image = gravatar.url(app.User.email, {s:36, r:'g', d: 'mm'}, {protocol: 'https'});
				} else if (app.User.image !== 'default') {
                    image = '/img/users/' + app.User.image
                }
				users_authorized.push({ user_id: app.User.id, 
										role_id: app.role_id, 
										username: app.User.username,
										image: image,
										added: 1 }); // Added parameter is to control which elements will be deleted or added 
													 // to the table when authorizing other users
			});

			// Array to indicate which roles are going to be search
			var where_search_role = []

			// If permission is assign only public owned roles
			if (req.user_permissions.includes('6')) {
				where_search_role.push({id: user_logged_roles});
			}

			// If permission is assign all public owned roles
			if (req.user_permissions.includes('5')) {
				where_search_role.push({oauth_client_id: req.application.id})
			}

			// If permission is assign only internal roles
			if (req.user_permissions.includes('1')) {
				where_search_role.push({is_internal: true});
			}

			// Search roles to display when authorize users
			models.role.findAll({
				where: { [Op.or]: where_search_role },
				attributes: ['id', 'name'],
				order: [['id', 'DESC']]
			}).then(function(roles) {
				if (roles.length > 0) {
					// Filter users_authorized depends on the permissions of the user logged
					for (var i = 0; i < users_authorized.length; i++) {
						if (roles.some(role => role.id === users_authorized[i].role_id) === false) {
							users_authorized[i].role_id = ""
						}
					}

					// Sen info about roles, users authorized and application
					res.send({ application: req.application, 
							   users_authorized: users_authorized, 
							   roles: roles,
							   errors: [] });
				} else { 
					res.send({text: ' failed.', type: 'danger'}); 
				}
			}).catch(function(error) { next(error); });
		}).catch(function(error) { next(error); });
	} else {
		// Redirect to show application if the request is via browser
		res.redirect('/idm/applications/'+req.application.id)
	}
}


// POST /idm/applications/:applicationId/users/available -- Search users to authorize in an application
exports.available_users = function(req, res) {

	debug("--> available_users")

	// Obtain key to search in the user table
	var key = req.body.username

	// Search if username is like the input key
	models.user.findAll({
	 	attributes: ['username', 'id', 'image', 'email', 'gravatar'],
		where: {
            username: {
                like: '%' + key + '%'
            }
        }
	}).then(function(users) {
		// If found, send ana array of users with the username and the id of each one
		if (users.length > 0) {
			users.forEach(function(elem, index, array) {
                if (elem.gravatar) {
					elem.image = gravatar.url(elem.email, {s:36, r:'g', d: 'mm'}, {protocol: 'https'});
				} else if (elem.image !== 'default') {
                    elem.image = '/img/users/' + elem.image
                } else {
                	elem.image = '/img/logos/medium/user.png'
                }
			});
			res.send(users)
		} else {
			// If the result is null send an error message
			res.send('no_users_found')
		}
	});

}

// POST /idm/applications/:applicationId/edit/users -- Authorize users in an application
exports.authorize_users = function(req, res, next) {

	debug("--> authorize_users")

	// Parse de body and filter to delete the rows with no role assigned to the user
	var users_to_be_authorized = JSON.parse(req.body.submit_authorize)

	// If the array is not empty change values in role_user table 
	if (users_to_be_authorized.length > 0) {

		// Search for actual values of role assignment to users
		models.role_user.findAll({
			where: { oauth_client_id: req.application.id },
			attributes: ['role_id', 'user_id', 'oauth_client_id']
		}).then(function(users_application_actual) {
			if (users_application_actual.length > 0) {

				// Array to indicate which roles are going to be search
				var where_search_role = []

				// If permission is assign only public owned roles
				if (req.user_permissions.includes('6')) {
					where_search_role.push({id: req.user_roles});
				}

				// If permission is assign all public owned roles
				if (req.user_permissions.includes('5')) {
					where_search_role.push({oauth_client_id: req.application.id})
				}

				// If permission is assign only internal roles
				if (req.user_permissions.includes('1')) {
					where_search_role.push({is_internal: true});
				}

				// Search roles to display when authorize users
				models.role.findAll({
					where: { [Op.or]: where_search_role },
					attributes: ['id']
				}).then(function(roles) {
					if (roles.length > 0) {

						// See differences between actual assignment and the data received from client
						var new_authorization_users = authorize_all(users_application_actual, users_to_be_authorized, req.application, roles)

						if (new_authorization_users.delete_row.length <= 0 && new_authorization_users.add_row.length <= 0) {
							req.session.message = {text: ' No changes.', type: 'success'};
							return res.redirect('/idm/applications/'+req.application.id);
						}
						// Destroy users that now are not authorized now
						for(var i = 0; i < new_authorization_users.delete_row.length; i++) {
							models.role_user.destroy({
								where: new_authorization_users.delete_row[i]
							})
						}

						models.role_user.bulkCreate(new_authorization_users.add_row).then(function() {
							// Send message of success in updating authorizations
							req.session.message = {text: ' Modified users authorization.', type: 'success'};
							res.redirect('/idm/applications/'+req.application.id)
						}).catch(function(error) {
							// Send message of fail when updating authorizations
							req.session.message = {text: ' Modified users authorization error.', type: 'warning'};
							res.redirect('/idm/applications/'+req.application.id)
						});
					} else {
						req.session.message = {text: ' Not authorized.', type: 'danger'};
						return res.redirect('/idm/applications/'+req.application.id);
					}
				}).catch(function(error) {
					req.session.message = {text: ' Error when authorizing.', type: 'danger'};
					return res.redirect('/idm/applications/'+req.application.id);
				});
			} else { next(new Error("The applications hasn't got users authorized"));}
		}).catch(function(error) { next(error); });
	} else {
		req.session.message = {text: ' Application must have a user authorized.', type: 'danger'};
		res.redirect('/idm/applications/'+req.application.id)
	}
}

// Method to see how add new rows to role_user database
function authorize_all(actual, change, application, roles) {

	// Array with rows to delete
	var delete_row = []

	// Array with rows to add
	var add_row = []
	for (var i = 0; i < change.length; i++) {
		// See if user can add or delete the new assignment by checking if the role is 
		// in the list of roles that the user can assign
		if (roles.some(role => role.id === change[i].role_id)) {

			// If has change the actual roles, add row to delete_row array
			if(change[i].added === 0) {
				delete_row.push({user_id: change[i].user_id, role_id: change[i].role_id, oauth_client_id: application.id})
			// If not, see if the table contains the row. If not add to add_row array
			} else if (change[i].added === 1) {
				if(actual.some(elem => (elem.user_id === change[i].user_id && elem.role_id === change[i].role_id)) === false) {
					add_row.push({user_id: change[i].user_id, role_id: change[i].role_id, oauth_client_id: application.id})
				}
			}
		}
	}

	return { delete_row: delete_row, add_row: add_row}
}
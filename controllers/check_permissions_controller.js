var models = require('../models/models.js');

var debug = require('debug')('idm:check_permissions_controller')

// Middleware to see user permissions in the application
exports.owned_permissions = function(req, res, next) {

	debug("--> owned_permissions")

	// Search roles owned by user in the application
	models.role_user.findAll({
		where: { user_id: req.session.user.id, 
				 oauth_client_id: req.application.id }
	}).then(function(user_application) {

		// Use the roles of the user to obtain all permissions 
		if (user_application.length > 0) {
			var user_roles = []
			user_application.forEach(function(app) {
				user_roles.push(app.role_id)
			});

			req.user_roles = user_roles;
			// Search permissions using the roles obtained
			models.role_permission.findAll({
				where: { role_id: user_roles },
				attributes: ['permission_id'],
			}).then(function(user_permissions) {

				// Pre load permissions of user in request
				var user_permissions_id = user_permissions.map(elem => elem.permission_id)
				req.user_permissions = user_permissions_id;
				// Check if the user can access to a specific route according to his permissions
				if(check_user_action(req.application, req.path, req.method, user_permissions_id)) {
					next();	
				} else {
					// Send an error if the the request is via AJAX or redirect if is via browser
					var response = {text: ' failed.', type: 'danger'};

					// Send response depends on the type of request
					send_response(req, res, response, '/idm/applications');
				}
			}).catch(function(error) { 
				// Reponse with message
				var response = {text: ' Error searching user permissions', type: 'danger'};

				// Send response depends on the type of request
				send_response(req, res, response, '/idm/applications');
			});
		} else {
			// Reponse with message
			var response = {text: ' User is not authorized', type: 'danger'};

			// Send response depends on the type of request
			send_response(req, res, response, '/idm/applications');
		}
	}).catch(function(error) { 
		// Reponse with message
		var response = {text: ' Error searching user permissions', type: 'danger'};

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications'); 
	});
}

// Method to see users permissions to do some actions
// - 1 Get and assign all internal application roles
// - 2 Manage the application
// - 3 Manage roles
// - 4 Manage authorizations
// - 5 Get and assign all public application roles
// - 6 Get and assign only public owned roles
function check_user_action(application, path, method, permissions) {
	switch(true) {
		case (path.includes('step/avatar')):
			if (permissions.includes('2')) {
				return true;
			}
	        break;
	    case (path.includes('step/roles') || path.includes('edit/roles') || path.includes('edit/permissions')):
	        if (permissions.includes('3')) {
				return true;
			}
	        break;
	    case (path.includes('edit/users')):
	    	if (permissions.some(r=> ['1','5','6'].includes(r))) {
	    		return true;
	    	}
	        break;    
	    case (path.includes('edit') || path.includes('iot') || path.includes('pep')):
	        if (permissions.includes('2')) {
				return true;
			}
	        break;
	    case (path.includes(application.id) && method === 'DELETE'):
	        if (permissions.includes('2')) {
				return true;
			}
	        break;
	    default:
	        return false;
	}
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
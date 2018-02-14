var models = require('../models/models.js');
var uuid = require('uuid');

var debug = require('debug')('idm:pep_proxy_controller');

// Autoload info if path include pepId
exports.load_pep = function(req, res, next, pepId) {

	debug("--> load_pep");

	// Add id of pep proxy in request
	req.pep = {id: pepId}
	next();
}

// GET /idm/applications/:applicationId/pep/register -- Register Pep Proxy
exports.register_pep = function(req, res, next) {

	debug("--> register_pep");

	// See if the application has already assigned a pep proxy
	models.pep_proxy.findOne({
		where: { oauth_client_id: req.application.id }
	}).then(function(pep_proxy) {
		// If not create it
		if(!pep_proxy) {

			// Id and password of the proxy
			var id = 'pep_proxy_'+uuid.v4()
			var password = 'pep_proxy_'+uuid.v4()

			// Build a new row in the pep_proxy table
			var pep_proxy = models.pep_proxy.build({id: id, password: password, oauth_client_id: req.application.id});
			pep_proxy.save({fields: ['id','password','oauth_client_id']}).then(function() {
				// Send message of success in create a pep proxy
				var response = { message: {text: ' Create Pep Proxy.', type: 'success'}, 
								 pep: {id: id, password: password}}

				// Send response depends on the type of request
				send_response(req, res, response, '/idm/applications/'+req.application.id);
			}).catch(function(error) {
				// Send message of fail when create a pep proxy
				var response = {text: ' Failed create Pep Proxy.', type: 'warning'}

				// Send response depends on the type of request
				send_response(req, res, response, '/idm/applications/'+req.application.id);

			});
		} else {
			var response = {text: ' Pep Proxy already created.', type: 'warning'}
			
			// Send response depends on the type of request
			send_response(req, res, response, '/idm/applications/'+req.application.id);

		}
	}).catch(function(error) { 
		var response = {text: ' Failed create Pep Proxy.', type: 'warning'}

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);
	});
	
}

// DELETE /idm/applications/:applicationId/pep/:pepId/delete -- Delete Pep Proxy
exports.delete_pep = function(req, res, next) {

	debug("--> delete_pep");

	// Destroy pep proxy form table
	models.pep_proxy.destroy({
		where: { id: req.pep.id,
				 oauth_client_id: req.application.id }
	}).then(function(deleted) {
		if (deleted) {
			// Send message of success of deleting pep proxy
			var response = {text: ' Pep Proxy was successfully deleted.', type: 'success'}
		} else {
			// Send message of fail when deleting pep proxy
			var response = {text: ' Failed deleting pep proxy', type: 'danger'}
		}

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);
	}).catch(function(error) {
		// Send message of fail when deleting pep proxy
		var response = {text: ' Failed deleting pep proxy', type: 'danger'};

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);
	});
}

// GET /idm/applications/:applicationId/pep/:pepId/reset_password -- Change password to Pep Proxy
exports.reset_password_pep = function(req, res, next) {

	debug("--> reset_password_pep");

	// New password
	var password_new = 'pep_proxy_'+uuid.v4()

	models.pep_proxy.update(
		{ password: password_new },
		{
			fields: ["password"],
			where: { id: req.pep.id,
				 	 oauth_client_id: req.application.id }
		}
	).then(function(reseted){
		if (reseted[0] === 1) {
			// Send message of success changing password pep proxy
			var response = {message: {text: ' Pep Proxy was successfully updated.', type: 'success'}, 
							pep: {id: req.pep.id, password: password_new}}
		} else {
			// Send message of failed when reseting iot sensor
			var response = {text: ' Failed changing password pep proxy', type: 'danger'}
		}

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);
	}).catch(function(error) {
		// Send message of fail when changing password to pep proxy
		var response = {text: ' Failed changing password pep proxy', type: 'danger'};

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);
	});
}

// MW to check pep proxy authentication
exports.authenticate = function(id, password, callback) {

    debug("--> authenticate")

    // Search the user through the email
    models.pep_proxy.find({
        where: {
            id: id
        }
    }).then(function(pep_proxy) {
        if (pep_proxy) {
            // Verify password 
            if(pep_proxy.verifyPassword(password)){
                callback(null, pep_proxy);
            } else { callback(new Error('invalid')); }   
        } else { callback(new Error('pep_proxy_not_found')); }
    }).catch(function(error){ callback(error) });
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
var models = require('../../models/models.js');
var uuid = require('uuid');

var debug = require('debug')('idm:web-iot_controller');

// Autoload info if path include iotId
exports.load_iot = function(req, res, next, iotId) {

	debug("--> load_iot");

	// Add id of pep proxy in request
	req.iot = {id: iotId}
	next();
}

// GET /idm/applications/:applicationId/iot/register -- Register IoT sensor
exports.register_iot = function(req, res, next) {
	
	debug("--> register_iot");

	// Id and password of the sensor
	var id = 'iot_sensor_'+uuid.v4()
	var password = 'iot_sensor_'+uuid.v4()

	// Build a new row in the iot table
	var iot = models.iot.build({id: id, password: password, oauth_client_id: req.application.id});
	iot.save({fields: ['id','password','oauth_client_id', 'salt']}).then(function() {
		// Send message of success in create an iot sensor
		var response = { message: {text: ' Create IoT sensor.', type: 'success'}, 
						 iot: {id: id, password: password}}
		
		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);

	}).catch(function(error) {
		// Send message of fail when create an iot sensor
		var response = {text: ' Failed create IoT sensor.', type: 'warning'}

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);
	});
}

// DELETE /idm/applications/:applicationId/iot/:iotId/delete -- Delete Pep Proxy
exports.delete_iot = function(req, res, next) {

	debug("--> delete_iot");

	// Destroy pep proxy form table
	models.iot.destroy({
		where: { id: req.iot.id,
				 oauth_client_id: req.application.id }
	}).then(function(deleted) {
		if (deleted) {
			// Send message of success of deleting iot
			var response = {text: ' Iot sensor was successfully deleted.', type: 'success'}
		} else {
			// Send message of fail when deleting iot
			var response = {text: ' Failed deleting iot sensor', type: 'danger'}
		}

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);
	}).catch(function(error) {
		// Send message of fail when delete an iot sensor
		var response = {text: ' Failed create IoT sensor.', type: 'warning'}

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);
	});
}

// GET /idm/applications/:applicationId/iot/:iotId/reset_password -- Change password to Iot Sensor
exports.reset_password_iot = function(req, res, next) {

	debug("--> reset_password_iot");

	// New password
	var password_new = 'iot_sensor_'+uuid.v4()

	models.iot.update(
		{ password: password_new },
		{
			fields: ["password"],
			where: { id: req.iot.id,
				 	 oauth_client_id: req.application.id }
		}
	).then(function(reseted) {
		if (reseted[0] === 1) {
			// Send message of success changing password pep proxy
			var response = {message: {text: ' Iot sensor was successfully updated.', type: 'success'}, 
							iot: {id: req.iot.id, password: password_new},
							application: {id: req.application.id}}
		} else {
			// Send message of failed when reseting iot sensor
			var response = {text: ' Failed changing password Iot sensor', type: 'danger'}
		}

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);

	}).catch(function(error) {
		// Send message of fail when changing password to pep proxy
		var response = {text: ' Failed create IoT sensor.', type: 'warning'}

		// Send response depends on the type of request
		send_response(req, res, response, '/idm/applications/'+req.application.id);
	});
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
var models = require('../../models/models.js');
var config = require('../../config');
var debug = require('debug')('idm:web-eidas_credentials_controller');


// GET /idm/applications/:applicationId/step/eidas -- Form to add eIDAs credentials to application
exports.step_new_eidas_crendentials = function(req, res, next) {

	debug("--> step_new_eidas_crendentials");

	res.render('applications/step_create_eidas_crendentials', { application: req.application, eidas_credentials: [], errors: [], csrfToken: req.csrfToken() });
};

// POST /idm/applications/:applicationId/step/eidas -- Create eIDAs credentials
exports.step_create_eidas_crendentials = function(req, res, next) {

	debug("--> step_create_eidas_crendentials");

	var eidas_credentials = models.eidas_credentials.build(req.body.eidas);
	eidas_credentials.oauth_client_id = req.application.id

	eidas_credentials.validate().then(function() {
		/*eidas_credentials.save().then(function() {

		})*/
	}).catch(function(error) {
		var nameErrors = []
		if (error.errors.length) {
    		for (var i in error.errors) {
    			nameErrors.push(error.errors[i].message)
    		}
		}
		res.render('applications/step_create_eidas_crendentials', {application: req.application, eidas_credentials: eidas_credentials, errors: nameErrors, csrfToken: req.csrfToken()})
	})
	/*// See if the user has selected a image to upload
	if (req.file) {
		handle_uploaded_images(req, res, '/idm/applications/'+req.application.id+'/step/roles')
	// If not, the default image is assigned to the application
	} else {
		req.application.image = '/img/logos/original/app.png'
		res.redirect('/idm/applications/'+req.application.id+'/step/roles');
	}*/
};
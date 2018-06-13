var models = require('../../models/models.js');
var config = require('../../config');
var debug = require('debug')('idm:web-eidas_credentials_controller');
var fs = require('fs');

var saml2 = require('../../lib/saml2.js');
 
// Create identity provider
var idp_options = {
  sso_login_url: "https://se-eidas.redsara.es/EidasNode/ServiceProvider",
  sso_logout_url: "https://idm.vishub.org/saml2/logout",
  certificates: []
};
var idp = new saml2.IdentityProvider(idp_options);


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
		eidas_credentials.save().then(function() {
			res.redirect('/idm/applications/'+req.application.id+'/step/avatar');
		}).catch(function(error) { 
			req.session.message = {text: ' Fail creating eidas credentials.', type: 'warning'};
			res.redirect('/idm/applications/'+req.application.id);
		})
	}).catch(function(error) {
		var nameErrors = []
		if (error.errors.length) {
    		for (var i in error.errors) {
    			nameErrors.push(error.errors[i].message)
    		}
		}
		res.render('applications/step_create_eidas_crendentials', {application: req.application, eidas_credentials: eidas_credentials, errors: nameErrors, csrfToken: req.csrfToken()})
	})
};

// GET /idm/applications/:applicationId/saml2/metadata -- Expose metadata
exports.saml2_metadata = function(req, res, next) { 
	debug("--> saml2_metadata")

	models.eidas_credentials.findOne({
		where: { oauth_client_id: req.application.id }
	}).then(function(credentials) {

		var organization = {
			name: credentials.organization_name,
			url: credentials.organization_url
		}

		var contact = {
			support: {
				company: credentials.support_contact_person_company,
				name: credentials.support_contact_person_name,
				surname: credentials.support_contact_person_surname,
				email: credentials.support_contact_person_email,
				telephone_number: credentials.support_contact_person_telephone_number
			},
			technical: {
				company: credentials.technical_contact_person_company,
				name: credentials.technical_contact_person_name,
				surname: credentials.technical_contact_person_surname,
				email: credentials.technical_contact_person_email,
				telephone_number: credentials.technical_contact_person_telephone_number
			}
		}
		debug(contact)
		// Create service provider
		var sp_options = {
		  entity_id: "https://"+config.eidas.host+"/idm/applications/"+req.application.id+"/saml2/metadata",
		  private_key: fs.readFileSync("certs/idm-2018-key.pem").toString(),
		  certificate: fs.readFileSync("certs/idm-2018-cert.pem").toString(),
		  assert_endpoint: "https://"+config.eidas.host+"/idm/applications/"+req.application.id+"/saml2/login",
		  sign_get_request: true,
		  nameid_format: "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
		  auth_context: { comparison: "minimum", class_refs: ["http://eidas.europa.eu/LoA/low"] },
		  force_authn: true,
		  organization: organization,
		  contact: contact
		};

		var sp = new saml2.ServiceProvider(sp_options);

		res.type('application/xml');
	  	res.send(sp.create_metadata());
	}).catch(function(error) {
		next(error)
	})
}
var models = require('../../models/models.js');
var config = require('../../config');
var debug = require('debug')('idm:web-eidas_credentials_controller');
var fs = require('fs');
var async = require('async');
var exec = require('child_process').exec;

var saml2 = require('../../lib/saml2.js');
 
// Create identity provider
var idp_options = {
  sso_login_url: config.eidas.idp_host,
  sso_logout_url: "https://"+config.eidas.sp_host+"/saml2/logout",
  certificates: []
};
var idp = new saml2.IdentityProvider(idp_options);

// Create service provider
var sp_options = {
  entity_id: "",
  private_key: "",
  certificate: "",
  assert_endpoint: "",
  sign_get_request: true,
  nameid_format: "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
  auth_context: { comparison: "minimum", class_refs: ["http://eidas.europa.eu/LoA/low"] },
  force_authn: true,
  organization: {},
  contact: {}
};

var sp = new saml2.ServiceProvider(sp_options);

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
			generate_app_certificates(req.application.id).then(function() {
				res.redirect('/idm/applications/'+req.application.id+'/step/avatar');
			}).catch(function(error) {
				req.session.message = {text: ' Fail creating eidas certificates.', type: 'warning'};
				res.redirect('/idm/applications/'+req.application.id);
			})
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

		if (credentials) {
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

			sp.organization = organization
			sp.contact = contact
			sp.entity_id = "https://"+config.eidas.sp_host+"/idm/applications/"+req.application.id+"/saml2/metadata",
			sp.private_key = fs.readFileSync("certs/applications/"+req.application.id+"-key.pem").toString(),
			sp.certificate = fs.readFileSync("certs/applications/"+req.application.id+"-cert.pem").toString(),
			sp.assert_endpoint = "https://"+config.eidas.sp_host+"/idm/applications/"+req.application.id+"/saml2/login",

			res.type('application/xml');
		  	res.send(sp.create_metadata());
		} else {
			res.status(404).send("Application doesn`t exist or don't have saml2 metadata created")
		}
	}).catch(function(error) {
		next(error)
	})
}

// Function to generate SAML certifiactes
function generate_app_certificates(app_id) {

	return new Promise((resolve, reject) => {
		var key_name = 'certs/applications/' + app_id + '-key.pem'
		var csr_name = 'certs/applications/' + app_id + '-csr.pem'
		var cert_name = 'certs/applications/' + app_id + '-cert.pem'

		var key = 'openssl genrsa -out '+key_name+' 2048'
		var csr = 'openssl req -new -sha256 -key '+key_name+' -out '+csr_name+' -batch'
		var cert = 'openssl x509 -req -in '+csr_name+' -signkey '+key_name+' -out '+cert_name 

		var create_certificates =  key + ' && ' + csr + ' && ' + cert
		exec(create_certificates, function(error, stdout, stderr){
			if (error) {
				reject(error)
			} else {
				resolve()
			}
		})
	})

}
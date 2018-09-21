var models = require('../../models/models.js');
var config = require('../../config');
var fs = require('fs');
var debug = require('debug')('idm:saml2_controller');
var async = require('async');
var exec = require('child_process').exec;
var saml2 = require('../../lib/saml2.js');

// Create identity provider
var idp_options = {
  sso_login_url: config.eidas.idp_host,
  sso_logout_url: "https://"+config.eidas.gateway_host+"/saml2/logout",
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
			generate_app_certificates(req.application.id, eidas_credentials).then(function() {
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

	res.type('application/xml');
  	res.send(req.sp.create_metadata());
}

// POST /saml2/login -- Redirect to eIDAs Identity Provider
exports.login = function(req, res, next) {
	debug("--> login")

	delete req.body.email
	delete req.body.password
	delete req.query

  	res.redirect(307, config.eidas.idp_host);
}

// POST /idm/applications/:applicationId/saml2/ReturnPage -- Response from eIDAs with user credentials
exports.saml2_application_login = function(req, res, next) { 
	debug("--> saml2_application_login")

	var options = {request_body: req.body};

	req.sp.post_assert(idp, options, function(err, saml_response) {
		if (err != null) {
			debug(err)
			return res.sendStatus(500);
		}

		// Save name_id and session_index for logout
		// Note:  In practice these should be saved in the user session, not globally.
		var name_id = saml_response.user.name_id;
		var session_index = saml_response.user.session_index;

		var eidas_profile = {}

		for (var key in saml_response.user.attributes) {
		    if (saml_response.user.attributes.hasOwnProperty(key)) {
		    	eidas_profile[key] = saml_response.user.attributes[key][0]
		    }
		}

		create_user(name_id, eidas_profile).then(function(user) {
            req.session.user = {
            	id: user.id,
                username: user.username,
                image: '/img/logos/small/user.png'
            };

            var path = '/oauth2/authorize?'+
            				'response_type=code' + '&' +
            		   		'client_id=' + req.application.id + '&' +
            		   		'state=xyz' + '&' +
            		   		'redirect_uri=' + req.application.redirect_uri

            res.redirect(path)
		}).catch(function(error) {
			req.session.errors = error;
            res.redirect("/auth/login");
		})
	});
}

function create_user(name_id, eidas_profile) {

	return models.user.findOne({
		where: { eidas_id: name_id },
	}).then(function(user) {
		if (user) {
			return user
		} else {

	        var user = models.user.build({
	            username: eidas_profile.FirstName,
	            eidas_id: name_id,
	            extra: JSON.stringify({eidas_profile: eidas_profile}),
	            enabled: true
	        })

	        return user.save().then(function(user) {
	        	return user
	        }).catch(function(error) {
	        	return Promise.reject(error)
	        })
		}
	})
}

// Search eidas credentials associated to application
exports.search_eidas_credentials = function(req, res, next) {

	debug("--> search_eidas_credentials")

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

			// Create service provider
			var sp_options = {
				entity_id: "https://"+config.eidas.gateway_host+"/idm/applications/"+req.application.id+"/saml2/metadata",
				private_key: fs.readFileSync("certs/applications/"+req.application.id+"-key.pem").toString(),
				certificate: fs.readFileSync("certs/applications/"+req.application.id+"-cert.pem").toString(),
				assert_endpoint: "https://"+config.eidas.gateway_host+"/idm/applications/"+req.application.id+"/saml2/login",
				sign_get_request: true,
				nameid_format: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
				provider_name: credentials.organization_nif,
				auth_context: { comparison: "minimum", AuthnContextClassRef: ["http://eidas.europa.eu/LoA/low"] },
				force_authn: true,
				organization: organization,
				contact: contact,
				valid_until: config.eidas.metadata_expiration
			};


			var sp = new saml2.ServiceProvider(sp_options);

			req.sp = sp
			next()
			
		} else {
			next()
		}
	}).catch(function(error) {
		req.session.errors = error
        res.redirect('/')
	})
}

// Create auth xml request to be send to the idp
exports.create_auth_request = function(req, res, next) {
	if (req.sp) {

		var xml = req.sp.create_authn_request_xml(idp, {
			extensions: {
				'eidas:SPType': 'private',
				'eidas:RequestedAttributes': [
				/*{'eidas:RequestedAttribute': {
					'@FriendlyName': 'LegalName',
					'@Name': 'http://eidas.europa.eu/attributes/legalperson/LegalName',
					'@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
					'@isRequired': 'false'
				}},
				{'eidas:RequestedAttribute': {
					'@FriendlyName': 'LegalPersonIdentifier',
					'@Name': 'http://eidas.europa.eu/attributes/legalperson/LegalPersonIdentifier',
					'@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
					'@isRequired': 'false'
				}},*/
				{'eidas:RequestedAttribute': {
					'@FriendlyName': 'FamilyName',
					'@Name': 'http://eidas.europa.eu/attributes/naturalperson/CurrentFamilyName',
					'@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
					'@isRequired': 'true'
				}},
				{'eidas:RequestedAttribute': {
					'@FriendlyName': 'FirstName',
					'@Name': 'http://eidas.europa.eu/attributes/naturalperson/CurrentGivenName',
					'@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
					'@isRequired': 'true'
				}},
				{'eidas:RequestedAttribute': {
					'@FriendlyName': 'DateOfBirth',
					'@Name': 'http://eidas.europa.eu/attributes/naturalperson/DateOfBirth',
					'@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
					'@isRequired': 'true'
				}},
				{'eidas:RequestedAttribute': {
					'@FriendlyName': 'PersonIdentifier',
					'@Name': 'http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier',
					'@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
					'@isRequired': 'true'
				}}]
			}
		});

		req.saml_auth_request = {
			xml: xml,
			postLocationUrl: "https://"+config.eidas.gateway_host+"/idm/applications/"+req.application.id+"/saml2/login",
			redirectLocationUrl: "https://"+config.eidas.gateway_host+"/idm/applications/"+req.application.id+"/saml2/login"
		}
		next()
	} else {
		next()
	}
}

// Function to generate SAML certifiactes
function generate_app_certificates(app_id,eidas_credentials)  {

	debug("--> generate_app_certificates")

	return new Promise((resolve, reject) => {
		var key_name = 'certs/applications/' + app_id + '-key.pem'
		var csr_name = 'certs/applications/' + app_id + '-csr.pem'
		var cert_name = 'certs/applications/' + app_id + '-cert.pem'

		var key = 'openssl genrsa -out '+key_name+' 2048'
		var csr = 'openssl req -new -sha256 -key ' + key_name + 
				  	' -out ' + csr_name + 
				  	' -subj "/C=ES/ST=Madrid/L=Madrid/' +
				  	'O=' + eidas_credentials.organization_name +
				  	'/OU=' + eidas_credentials.organization_name +
				  	'/CN=' + eidas_credentials.organization_url.replace(/(^\w+:|^)\/\//, '') +'"'

		var cert = 'openssl x509 -days 1095 -req -in '+csr_name+' -signkey '+key_name+' -out '+cert_name 

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
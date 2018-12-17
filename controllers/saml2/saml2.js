var models = require('../../models/models.js');
var config = require('../../config');
var fs = require('fs');
var debug = require('debug')('idm:saml2_controller');
var async = require('async');
var exec = require('child_process').exec;
var saml2 = require('../../lib/saml2.js');

var config_attributes = require('../../etc/eidas/requested_attributes.json');
var config_attributes_natural = Object.keys(config_attributes.NaturalPerson)
var config_attributes_legal = Object.keys(config_attributes.LegalPerson)
var config_attributes_representative = Object.keys(config_attributes.RepresentativeNaturalPerson)

// Create identity provider
var idp_options = {
  sso_login_url: config.eidas.idp_host,
  sso_logout_url: "https://"+config.eidas.gateway_host+"/saml2/logout",
  certificates: []
};
var idp = new saml2.IdentityProvider(idp_options);

var sp_states = {};

// GET /idm/applications/:applicationId/step/eidas -- Form to add eIDAs credentials to application
exports.step_new_eidas_crendentials = function(req, res, next) {

	debug("--> step_new_eidas_crendentials");
	res.render('saml2/step_create_eidas_crendentials', { application: req.application, eidas_credentials: [], errors: [], csrfToken: req.csrfToken() });
};

// POST /idm/applications/:applicationId/step/eidas -- Create eIDAs credentials
exports.step_create_eidas_crendentials = function(req, res, next) {

	debug("--> step_create_eidas_crendentials");

	var eidas_credentials = models.eidas_credentials.build(req.body.eidas_credentials);
	eidas_credentials.oauth_client_id = req.application.id

	eidas_credentials['attributes_list'] = {
		NaturalPerson: [
			'PersonIdentifier',
			'FamilyName',
			'FirstName',
			'DateOfBirth'
		],
		LegalPerson: [],
		RepresentativeNaturalPerson: []
	}

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
		res.render('saml2/step_create_eidas_crendentials', {
			application: req.application,
			eidas_credentials: eidas_credentials,
			errors: nameErrors,
			csrfToken: req.csrfToken()
		})
	})
};

// GET /idm/applications/:applicationId/edit/eidas -- Render edit eIDAs credentials view
exports.edit_eidas_crendentials = function(req, res, next) {

	debug("--> edit_eidas_crendentials");

	res.render('saml2/edit_eidas', {
		application: req.application,
		eidas_credentials: req.eidas_credentials,
		errors: [],
		csrfToken: req.csrfToken()
	})
}

// PUT /idm/applications/:applicationId/edit/eidas/info -- Update eIDAS Info
exports.update_eidas_info = function(req, res, next) {

	debug("--> update_eidas_info");

	var eidas_credentials = models.eidas_credentials.build(req.body.eidas_credentials);
	eidas_credentials.oauth_client_id = req.application.id

	eidas_credentials.validate().then(function(err) {
		models.eidas_credentials.update(
			{ 	
				support_contact_person_name: req.body.eidas_credentials.support_contact_person_name,
				support_contact_person_surname: req.body.eidas_credentials.support_contact_person_surname,
				support_contact_person_email: req.body.eidas_credentials.support_contact_person_email,
				support_contact_person_telephone_number: req.body.eidas_credentials.support_contact_person_telephone_number,
				support_contact_person_company: req.body.eidas_credentials.support_contact_person_company,
				technical_contact_person_name: req.body.eidas_credentials.technical_contact_person_name,
				technical_contact_person_surname: req.body.eidas_credentials.technical_contact_person_surname,
				technical_contact_person_email: req.body.eidas_credentials.technical_contact_person_email,
				technical_contact_person_telephone_number: req.body.eidas_credentials.technical_contact_person_telephone_number,
				technical_contact_person_company: req.body.eidas_credentials.technical_contact_person_company,
				organization_name: req.body.eidas_credentials.organization_name,
				organization_url: req.body.eidas_credentials.organization_url,
				organization_nif: req.body.eidas_credentials.organization_nif,
				sp_type: req.body.eidas_credentials.sp_type },
			{
				fields: ['support_contact_person_name','support_contact_person_surname','support_contact_person_email','support_contact_person_telephone_number', 'support_contact_person_company',
						 'technical_contact_person_name','technical_contact_person_surname','technical_contact_person_email','technical_contact_person_telephone_number','technical_contact_person_company',
						 'organization_name','organization_url','organization_nif',
						 'sp_type'],
				where: {oauth_client_id: req.application.id}
			}
		).then(function() {
			// Send message of success of updating the application
			req.session.message = {text: ' eIDAS info updated successfully.', type: 'success'};
			res.redirect('/idm/applications/'+req.application.id);
		}).catch(function(error){
			res.locals.message = {text: ' Unable to update eIDAS info', type: 'danger'}
		 	res.render('saml2/edit_eidas', {
				application: req.application,
				eidas_credentials: req.body.eidas_credentials,
				errors: [],
				csrfToken: req.csrfToken()
			})
		});
	}).catch(function(error){
		// Send message of warning of updating the application
		res.locals.message = {text: ' Unable to update eIDAS info.', type: 'warning'};
		req.body.eidas_credentials.attributes_list = req.eidas_credentials.attributes_list

		var nameErrors = []
		if (error.errors.length) {
    		for (var i in error.errors) {
    			nameErrors.push(error.errors[i].message)
    		}
		}
		res.render('saml2/edit_eidas', {
			application: req.application,
			eidas_credentials: req.body.eidas_credentials,
			errors: nameErrors,
			csrfToken: req.csrfToken()
		})
	});
	
}


// PUT /idm/applications/:applicationId/edit/eidas/attributes -- Update eIDAS attributes
exports.update_eidas_attributes = function(req, res, next) {

	debug("--> update_eidas_attributes");

	var attributes_list = {
		NaturalPerson: [
			'PersonIdentifier',
			'FamilyName',
			'FirstName',
			'DateOfBirth'
		],
		LegalPerson: [],
		RepresentativeNaturalPerson: []
	}

	if (req.body.NaturalPerson) {
		var array_natural= Object.keys(req.body.NaturalPerson)
		for (var i=0; i < array_natural.length; i++) {
			if (config_attributes_natural.includes(array_natural[i]) 
				&& !attributes_list.NaturalPerson.includes(array_natural[i])) {

				attributes_list.NaturalPerson.push(array_natural[i])
			}
		}
	}

	if (req.body.LegalPerson) {
		var array_legal= Object.keys(req.body.LegalPerson)
		for (var i=0; i < array_legal.length; i++) {
			if (config_attributes_legal.includes(array_legal[i]) 
				&& !attributes_list.LegalPerson.includes(array_legal[i])) {

				attributes_list.LegalPerson.push(array_legal[i])
			}
		}
	}

	if (req.body.RepresentativeNaturalPerson) {
		var array_representative= Object.keys(req.body.RepresentativeNaturalPerson)
		for (var i=0; i < array_representative.length; i++) {
			if (config_attributes_representative.includes(array_representative[i]) 
				&& !attributes_list.RepresentativeNaturalPerson.includes(array_representative[i])) {

				attributes_list.RepresentativeNaturalPerson.push(array_representative[i])
			}
		}
	}

	models.eidas_credentials.update(
		{ 
			attributes_list: attributes_list 
		},
		{
			fields: ['attributes_list'],
			where: {oauth_client_id: req.application.id}
		}
	).then(function(){
		req.session.message = {text: ' eIDAS attributes successfully updated.', type: 'success'}
		res.redirect('/idm/applications/' + req.application.id);
	}).catch(function(error) {
		debug('Error', error)
		req.session.message = {text: ' Fail update eIDAS attributes.', type: 'danger'};
		res.redirect('/idm/applications/' + req.application.id);
	});
}


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

// POST /idm/applications/:applicationId/saml2/login -- Response from eIDAs with user credentials
exports.saml2_application_login = function(req, res, next) { 
	debug("--> saml2_application_login", req.url)

	var options = {request_body: req.body};

	req.sp.post_assert(idp, options, function(err, saml_response) {
		if (err != null) {
			debug(err)
			return res.status(500).send('Internal Error');
		}

		// Save name_id and session_index for logout
		// Note:  In practice these should be saved in the user session, not globally.
		var name_id = saml_response.user.name_id;

		// Commented beacuase no session index was returned when testing was performed
		//var session_index = saml_response.user.session_index;

		// Response To variable to check state of previous request
		var response_to = saml_response.response_to

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

            var state = (sp_states[response_to]) ? sp_states[response_to] : 'xyz'

            var path = '/oauth2/authorize?'+
            				'response_type=code' + '&' +
            		   		'client_id=' + req.application.id + '&' +
            		   		'state=' + state + '&' +
            		   		'redirect_uri=' + req.application.redirect_uri

            res.redirect(path)
		}).catch(function(error) {
			debug('Error', error)
			req.session.errors = error;
            res.redirect("/auth/login");
		})
	});
}

function create_user(name_id, new_eidas_profile) {

	return models.user.findOne({
		where: { eidas_id: name_id },
	}).then(function(user) {
		if (user) {
			// Update de eidas profile

			var actual_eidas_profile_keys = Object.keys(user.extra.eidas_profile);
			var new_eidas_profile_keys = Object.keys(new_eidas_profile);

			let difference = new_eidas_profile_keys.filter(x => !actual_eidas_profile_keys.includes(x));
			var new_attributes = user.extra.eidas_profile;

			for (var i =0; i < difference.length; i++) {
				new_attributes[difference[i]] = new_eidas_profile[difference[i]];
			}

			var user_extra = user.extra;
			Object.assign(user_extra.eidas_profile, new_attributes);
			return models.user.update(
				{ 
					extra: user_extra
				},
				{
					fields: ['extra'],
					where: {id: user.id}
				}
			).then(function(){
				return user
			}).catch(function(error) {
				new Promise.reject(error)
			});
		} else {
	        var user = models.user.build({
	            username: new_eidas_profile.FirstName + ' ' + new_eidas_profile.FamilyName,
	            eidas_id: name_id,
	            extra: {eidas_profile: new_eidas_profile},
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
				audience: "https://"+config.eidas.gateway_host+"/idm/applications/"+req.application.id+"/saml2/login",
				sign_get_request: true,
				nameid_format: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
				provider_name: credentials.organization_nif,
				auth_context: { comparison: "minimum", AuthnContextClassRef: ["http://eidas.europa.eu/LoA/low"] },
				force_authn: true,
				organization: organization,
				contact: contact,
				valid_until: config.eidas.metadata_expiration,
				sp_type: credentials.sp_type

			};

			var sp = new saml2.ServiceProvider(sp_options);

			req.eidas_credentials = credentials

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

var get_state = function(url) {

	console.log('PATH', url.split('?'));

	var params = url.split('?')[1].split('&');
	var state = '';
	for (var p in params) {
		if (params[p].split('=')[0] === 'state') {
			state = params[p].split('=')[1];
		}
	}

	console.log('STATE', state);
	return state;
}

// Create auth xml request to be send to the idp
exports.create_auth_request = function(req, res, next) {
	if (req.sp) {

		var array_natural = req.eidas_credentials.attributes_list.NaturalPerson
		var array_legal = req.eidas_credentials.attributes_list.LegalPerson
		var array_representative = req.eidas_credentials.attributes_list.RepresentativeNaturalPerson

		var extensions = {
			'eidas:SPType': req.eidas_credentials.sp_type,
			'eidas:RequestedAttributes': []
		}

		
		for (var i=0; i < array_natural.length; i++) {
			extensions['eidas:RequestedAttributes'].push({
				'eidas:RequestedAttribute': config_attributes.NaturalPerson[array_natural[i]]
			})
		}

		for (var i=0; i < array_legal.length; i++) {
			extensions['eidas:RequestedAttributes'].push({
				'eidas:RequestedAttribute': config_attributes.LegalPerson[array_legal[i]]
			})
		}

		for (var i=0; i < array_representative.length; i++) {
			extensions['eidas:RequestedAttributes'].push({
				'eidas:RequestedAttribute': config_attributes.RepresentativeNaturalPerson[array_representative[i]]
			})
		}

		var auth_request = req.sp.create_authn_request_xml(idp, {
			extensions: extensions
		});

		sp_states[auth_request.id] = get_state(req.url);

		req.saml_auth_request = {
			xml: auth_request.request,
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
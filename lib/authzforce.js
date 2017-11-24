// Set methods to create domains in authzforce and define policies

var ejs = require('ejs');
var http = require('http');
var Promise = require('bluebird');
//var models = require('../models/models.js');
var config = require ('../config.js').authzforce;

// Function to get authzforce domain of application
function get_application_domain(application) {

	return new Promise(function(resolve, reject) {

		// See if application has an authzforce domain assigned, if not create it
		if (!application.az_domain) {

			// Fill template with application id
			ejs.renderFile(__dirname + '/../lib/authzforce_templates/domain.ejs', {app_id: application.id}, function(error, body) {

				if (!error) {

					// Set headers
			        var headers = {
					    'Accept': 'application/xml',
					    'Content-Type': 'application/xml; charset=UTF-8', 
					};

					// Set host and port from config file
			        var options = {
					    host: config.host,
					    port: config.port,
					    path: '/authzforce-ce/domains',
					    method: 'POST',
					    headers: headers
					};

					// Send an http request to authzforce 
			        var req = http.request(options, function(response) {
				  		response.setEncoding('utf-8');

				  		var response_body = ''
				  		response.on('data', function(chunk) {
						  response_body += chunk
						});

						response.on('end', function() {
							if (response.statusCode === 200) {
								var domain = response_body.split('href=')[1].split('\"')[1]
								resolve(domain);
							} else {
								reject(response.statusCode)
							}
						});
					});

			        // Check error in request
					req.on('error', function(e) {
						reject('Conexion with authzforce failed')
					});

					// Set body of request with the filled template
					req.write(body);
					req.end();
				} else {
					reject(error)
				}
		    });
		} else {
			resolve(application.az_domain)
		}
	})
}

// Function to create policy of application
function policy_set_update(application, az_domain, role_permissions) {

	return new Promise(function(resolve, reject) {

		// Info to set in template
		var policy_id = 'POLITICAL'

		var context = {
	        'role_permissions': role_permissions,
	        'app_id': application.id,
	        'policy_id': policy_id
	    }

		ejs.renderFile(__dirname + '/../lib/authzforce_templates/policy_set.ejs', context, function(error, body) {

			if (!error) {

				// Set headers
		        var headers = {
				    'Accept': 'application/xml; charset=UTF-8',
				    'Content-Type': 'application/xml; charset=UTF-8', 
				};

				// Set host and port from config file
		        var options = {
				    host: config.host,
				    port: config.port,
				    path: '/authzforce-ce/domains/'+az_domain+'/pap/policies',
				    method: 'POST',
				    headers: headers
				};

				// Send an http request to authzforce 
		        var req = http.request(options, function(response) {
			  		response.setEncoding('utf-8');		  		
			  		resolve({ status: response.statusCode, az_domain: az_domain, policy_id: policy_id})
				});

		        // Check error in request
				req.on('error', function(e) {
					reject(error)
				  	console.log('Conexion with authzforce failed');
				});

				// Set body of request with the filled template
				req.write(body);
				req.end();
			} else {
				reject(error)
			}
		});
	});
}

// Function to activate policy of application
function activate_policy(az_domain, policy_id) {

	return new Promise(function(resolve, reject) {
		//var policy_id = 'POLITICAL'

		ejs.renderFile(__dirname + '/../lib/authzforce_templates/policy_properties.ejs', {'policy_id': policy_id }, function(error, body) {

			if (!error) {

				// Set headers
		        var headers = {
				    'Accept': 'application/xml; charset=UTF-8',
				    'Content-Type': 'application/xml; charset=UTF-8', 
				};

				// Set host and port from config file
		        var options = {
				    host: config.host,
				    port: config.port,
				    path: '/authzforce-ce/domains/'+az_domain+'/pap/pdp.properties',
				    method: 'PUT',
				    headers: headers
				};

				// Send an http request to authzforce 
		        var req = http.request(options, function(response) {
			  		response.setEncoding('utf-8');		
			  		resolve(response.statusCode)
				});

		        // Check error in request
				req.on('error', function(e) {
					reject(error)
				  	console.log('Conexion with authzforce failed');
				});

				// Set body of request with the filled template
				req.write(body);
				req.end();
			} else {
				reject(error)
			}
		});
	});
}

function prueba(application, role_permissions) {
	if (application) {
		get_application_domain(application)
			.then(function(az_domain){
				console.log("DOMAIN OF APPLICATION IS: " + az_domain)
				return policy_set_update(application, az_domain, role_permissions)
			}).then(function(policy) {
				console.log("RESPONSE CODE FROM POLICY CREATION: " + policy.status)
				return activate_policy(policy.az_domain, policy.policy_id)
			}).then(function(activate) {
				console.log("RESPONSE CODE FROM POLICY ACTIVATION: " + activate)
			}).catch(function(error) {
				console.log(error)
			})
	} else {
		console.log("no_pasa")
	}
}

var esoes = {ALEX: [{id:'ALEX_PERM1', name: 'ALEX_PERM1_NAME',action: 'ALEX_PERM1_ACTION',resource: 'ALEX_PERM1_RESOURCE',xml: undefined},
						 {id:'ALEX_PERM2', name: 'ALEX_PERM2_NAME',action: 'ALEX_perm2_action',resource: 'ALEX_PERM2_RESOURCE',xml: undefined}]/*, 
				 PEPE: [{id:'PEPE_PERM1', name: 'PEPE_PERM1_NAME',action: undefined,resource: undefined,xml: 'PEPE_PERM1_XML'}]*/}

var application = {id: "app_id", az_domain: "XeDvddEKEeew9QJCrBEAAg"}

prueba(application, esoes)
// var domain = get_application_domain(null)
//policyset_update(null, null)
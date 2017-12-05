// Set methods to create domains in authzforce and define policies

var ejs = require('ejs');
var http = require('http');
var Promise = require('bluebird');
var uuid = require('uuid');
var config = require ('../config.js').authzforce;

// Handle domain and policy creation
exports.handle = function(domain, role_permissions) {
	return new Promise(function(resolve, reject) {
		var get_domain = get_application_domain(domain);
		var get_policy = get_domain.then(function(az_domain) {
			return policy_set_update(domain.oauth_client_id, az_domain.domain_id, az_domain.version_policy, az_domain.policy, role_permissions)
		});
		var activate = get_policy.then(function(create) {
			return activate_policy(create.az_domain, create.policy, create.version_policy)
		});

		return Promise.all([get_domain, get_policy, activate]).then(function(values) {
			resolve(values)
		}).catch(function(error){
			reject(error)
		})
	})
}

// Function to get authzforce domain of application
function get_application_domain(domain) {

	return new Promise(function(resolve, reject) {
		// See if application has an authzforce domain assigned, if not create it
		if (!domain.az_domain) {
			// Fill template with application id
			ejs.renderFile(__dirname + '/../lib/authzforce_templates/domain.ejs', {app_id: domain.oauth_client_id}, function(error, body) {

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
								resolve({domain_id: domain, policy: undefined, version_policy: 1})
							} else {
								reject(response.statusCode)
							}
						});
					});

			        // Check error in request
					req.on('error', function(e) {
						reject('Create domain: connection with authzforce failed')
					});

					// Set body of request with the filled template
					req.write(body);
					req.end();
				} else {
					reject(error)
				}
		    });
		} else {
			resolve({domain_id: domain.az_domain, policy: domain.policy, version_policy: domain.version})
		}
	})
}

// Function to create policy of application
function policy_set_update(application_id, az_domain, policy_version, policy, role_permissions) {

	return new Promise(function(resolve, reject) {

		// Info to set in template
		if (policy) {
			policy_version = policy_version + 1
		} else {
			policy = uuid.v4()
		}

		var context = {
	        'role_permissions': role_permissions,
	        'app_id': application_id,
	        'policy_id': policy,
	        'version_policy': policy_version 
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
			  		resolve({ status: response.statusCode, az_domain: az_domain, policy: policy, version_policy: policy_version})
				});

		        // Check error in request
				req.on('error', function(e) {
				  	reject('Create policy: connection with authzforce failed')
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
function activate_policy(az_domain, policy, version_policy) {

	return new Promise(function(resolve, reject) {

		ejs.renderFile(__dirname + '/../lib/authzforce_templates/policy_properties.ejs', {'policy_id': policy }, function(error, body) {
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
			  		resolve({ status: response.statusCode, az_domain: az_domain, policy: policy, version_policy: version_policy})
				});

		        // Check error in request
				req.on('error', function(e) {
				  	reject('Activate policy: connection with authzforce failed')
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

/*function cosas() {

	var application = {oauth_client_id: "app_id", az_domain: "TANVutj6Eee8SwJCrBEAAg", policy: "5e2b7aaa-1eeb-4c04-96be-297afffd36da", version: 2}
	var role_permissions = {ALEX: [{id:'ALEX_PERM1', name: 'ALEX_PERM1_NAME',action: 'ALEX_PERM1_ACTION',resource: 'ALEX_PERM1_RESOURCE',xml: undefined},
					 {id:'ALEX_PERM2', name: 'ALEX_PERM2_NAME',action: 'ALEX_perm2_action',resource: 'ALEX_PERM2_RESOURCE',xml: undefined}], 
			 PEPE: [{id:'PEPE_PERM1', name: 'PEPE_PERM1_NAME',action: undefined,resource: undefined,xml: xml_rule}]}

	handle(application, role_permissions).then(function(authzforce_response) {
		console.log("DOMAIN OF APPLICATION IS: " + authzforce_response[1].az_domain)
		console.log("POLICY ID: " + authzforce_response[1].policy_id)
		console.log("VERSION OF POLICY: " + authzforce_response[1].version_policy)
		console.log("RESPONSE CODE FROM POLICY ACTIVATION: " + authzforce_response[2].status)

		if (authzforce_response[1].status === 200) {
			console.log("Success creating policy")

		// If response is different of 200 don't update the version
		}  else if (authzforce_response[1].status === 400) {
			authzforce_response[1].version_policy = authzforce_response[0].version_policy
			console.log("XACML rule bad written")
		} else if (authzforce_response[1].status === 409) {
			authzforce_response[1].version_policy = authzforce_response[0].version_policy
			console.log("Error with policy version")
		} else {
			authzforce_response[1].version_policy = authzforce_response[0].version_policy
			console.log("Authzforce error")
		}

		if (authzforce_response[2].status === 200) {
			console.log("Success activating policy")
		} else {
			authzforce_response[2].version_policy = authzforce_response[0].version_policy
			console.log("Error activating policy")
		}
		console.log(authzforce_response)
	}).catch(function(error) {
		console.log(error)
	})
}*/



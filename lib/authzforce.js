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




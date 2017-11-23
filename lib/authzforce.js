// Set methods to create domains in authzforce and define policies

var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var http = require('http');
var Promise = require('bluebird');

// Load function to fill templates

// Load templates
/*var xacml_template = fs.readFileSync(path.join(__dirname, 'authzforce_templates/policy_set.xacml')).toString();
var domain_template = fs.readFileSync(path.join(__dirname, 'authzforce_templates/domain.xacml')).toString();
var policy_template = fs.readFileSync(path.join(__dirname, 'authzforce_templates/policy_properties.xacml')).toString();*/

// Function to get authzforce domain of application and 
function get_application_domain(application) {

	return new Promise(function(resolve, reject) {
		if (!application.az_domain) {
			ejs.renderFile(__dirname + '/../lib/authzforce_templates/domain.ejs', {app_id: 'tolai'}, function(error, result) {
		        var body = result;
		        var headers = {
				    'Accept': 'application/xml',
				    'Content-Type': 'application/xml;charset=UTF-8', 
				};

		        var options = {
				    host: 'localhost',
				    port: '8080',
				    path: '/authzforce-ce/domains',
				    method: 'POST',
				    headers: headers
				};

		        var req = http.request(options, function(response) {
			  		response.setEncoding('utf-8');
			  		console.log('STATUS: ' + response.statusCode);

			  		var response_body = ''
			  		response.on('data', function(chunk) {
					  response_body += chunk
					});

					response.on('end', function() {
						var domain = response_body.split('href=')[1].split('\"')[1]
						resolve(domain);
					});
				});

				req.on('error', function(e) {
					reject(error)
				  	console.log('Problem with the Inventing Room subscription');
				});

				req.write(body);
				req.end();
		    });
		} else {
			resolve(application.az_domain)
		}
	})
}

function policyset_update(application, role_permissions) {

	var esoes = {TOLAI: [{id:'TOLAI_PERM1', name: 'TOLAI_PERM1_NAME',action: 'TOLAI_PERM1_ACTION',resource: 'TOLAI_PERM1_RESOURCE',xml: undefined},
						 {id:'TOLAI_PERM2', name: 'TOLAI_PERM2_NAME',action: 'tolai_perm2_action',resource: 'TOLAI_PERM2_RESOURCE',xml: undefined}], 
				 ZOPENCO: [{id:'ZOPENCO_PERM1', name: 'ZOPENCO_PERM1_NAME',action: undefined,resource: undefined,xml: 'ZOPENCO_PERM1_XML'}]}
	var app_id = 'APPLICATION_ID'
	var policy_id = 'POLITICAL'

	context = {
        'role_permissions': esoes,
        'app_id': app_id,
        'policy_id': policy_id
    }

	ejs.renderFile(__dirname + '/../lib/authzforce_templates/policy_set.ejs', context, function(error, result) {
		console.log(error)
		console.log("--------------------")
		console.log(result)
	});
}

function prueba(application) {
	if (application) {
		get_application_domain(application).then(function(uaaaa){
			console.log("--------------------------------")
			console.log(uaaaa)
		})
	} else {
		console.log("no_pasaaaaaaa")
	}
}

var application = {id: "aaaaaaaaaa", az_domain: "sssssssssss"}
prueba(application)
// var domain = get_application_domain(null)
//policyset_update(null, null)
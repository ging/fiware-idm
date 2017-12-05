var authzforce = require ('../lib/authzforce.js');
var models = require('../models/models.js');


// Create all rules and policies in atuhzforce and save in database
exports.submit_authzforce_policies = function(req, res, submit_assignment) {

	// Delete roles provider and purchaser if they exist in request
	delete submit_assignment.provider
	delete submit_assignment.purchaser

	// Array of permission ids to search info about each permission
	var permissions = []

	// filter submit assignment to obtain all permission ids
	for (var role in submit_assignment) {
		permissions.push.apply(permissions, submit_assignment[role].filter(function(elem) {
			if (['1', '2', '3' ,'4' ,'5' ,'6'].includes(elem)) {
				return false;
			} else {
				return true;
			}
		}))
	}

	// Search permissions in the database
	models.permission.findAll({
		where: {id: permissions, oauth_client_id: req.application.id},
		includes: ['id', 'name', 'action', 'resource', 'xml']
	}).then(function(permissions_info) {
		if (permissions_info.length > 0) {
			// Object to be sent to authzforce to create policies
			var submit_authzforce = {}

			// Associate permission id to it's info
			for(var role in submit_assignment) {											
				for (var i = 0; i < submit_assignment[role].length; i++) {
					if (!['1', '2', '3' ,'4' ,'5' ,'6'].includes(submit_assignment[role][i])) {
						if (!submit_authzforce[role]) {
					        submit_authzforce[role] = [];
					    }
					    var permission = permissions_info.find(elem => elem.id === submit_assignment[role][i])
					    submit_authzforce[role].push(permission);
					}
				}
			}

			// Search if application has an authzforce domain associated
			models.authzforce.findOne({
				where: { oauth_client_id: req.application.id}
			}).then(function(domain) {
				if (!domain) {
					domain = {oauth_client_id: req.application.id}
				}

				if (submit_authzforce) {
					// Handle equest to authzforce
					authzforce.handle(domain, submit_authzforce).then(function(authzforce_response) {

						// Log info about request state
						console.log("DOMAIN OF APPLICATION IS: " + authzforce_response[1].az_domain)
						console.log("POLICY ID: " + authzforce_response[1].policy)
						console.log("VERSION OF POLICY: " + authzforce_response[1].version_policy)
						console.log("RESPONSE CODE FROM POLICY ACTIVATION: " + authzforce_response[2].status)

						var type = 'success'
						// Logs for authzforce policy creation or update
						if (authzforce_response[1].status === 200) {
							var message = ' Success creating policy.'
						}  else if (authzforce_response[1].status === 400) {
							var message = 'XACML rule bad written'
							type = 'warning' 
						} else if (authzforce_response[1].status === 409) {
							var message = 'Error with policy version' 
							type = 'warning'
						} else {
							var message = 'Authzforce error' 
							type = 'warning'
						}
						console.log("Authzforce create policy: " + message)

						// Logs for policy activation
						if (authzforce_response[2].status === 200) {
							console.log("Authzforce activate policy: success")
						} else {
							console.log("Authzforce activate policy: error")
						}

						if(domain.az_domain) {
							update_domain(req, res, domain, authzforce_response[1].version_policy)
						} else {
							create_domain(req, res, authzforce_response[1])
						}

						// Send message of success of assign permissions to roles
						req.session.message = {text: message, type: type};
						res.redirect("/idm/applications/"+req.application.id)
					}).catch(function(error) {
						console.log(error)
						req.session.message = {text: ' Authzforce error', type: 'warning'};
						res.redirect("/idm/applications/"+req.application.id)
					})
				} else {
					req.session.message = {text: ' invalid submit.', type: 'warning'};
					res.redirect("/idm/applications/"+req.application.id)
				}
			}).catch(function(error){
				console.log(error)
				req.session.message = {text: ' authzforce search error.', type: 'warning'};
				res.redirect("/idm/applications/"+req.application.id);
			})	
		} else {
			req.session.message = {text: ' no permissions.', type: 'warning'};
			res.redirect("/idm/applications/"+req.application.id);
		}
	}).catch(function(error) {
		console.log(error)
		req.session.message = {text: ' permission search error.', type: 'warning'};
		res.redirect("/idm/applications/"+req.application.id);
	});
}

// Create row in authzforce table
function create_domain(req,res, authzforce) {
	return models.authzforce.create({
		az_domain: authzforce.az_domain,
		policy: authzforce.policy,
		version: authzforce.version_policy,
		oauth_client_id: req.application.id
	}).then(function(created) {
		console.log("Success creating row in authzforce table")
	}).catch(function(error) {
		console.log("Error creating row in authzforce table")
	})
}

// Update row in authzforce table
function update_domain(req, res, domain, version) {
	return models.authzforce.update({
		version: version
	}, {	
		fields: ['version'],
		where: { az_domain: domain.az_domain,
				 policy: domain.policy,
				 oauth_client_id: req.application.id }
	}).then(function(updated) {
		console.log("Success updating authzforce table")
	}).catch(function(error) {
		console.log("Error updating authzforce table")
	})	
}
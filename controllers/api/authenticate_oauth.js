var models = require('../../models/models.js');
var oauth2_models = require('../../models/model_oauth_server.js');

var config_authzforce = require('../../config.js').authzforce
var debug = require('debug')('idm:api-authenticate_oauth');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Middleware to load oauth2 token info
exports.load_oauth = function(req, res, next, oauthTokenId) {
	
	if (!oauthTokenId) {
		res.status(400).json({ error: {message: 'Expecting to find Oauth Token in url', code: 400, title: 'Bad Request'}})
	} else {
		var subject_token = decodeURIComponent(oauthTokenId);

		// Search info of oauth token and include pep proxy
		search_oauth2_token(subject_token).then(function(token_owner) {
			//req.pep_proxy = pep_proxy
			req.token_owner = token_owner
			next()
		}).catch(function(error) {
			debug("Error: " + error)
			if (!error.error) {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
			next(error)
		})
	}
}

// Middlware to check request
exports.check_request = function(req, res, next) {
	if (!req.headers['x-auth-token']) {
		res.status(400).json({ error: {message: 'Expecting to find X-Auth-token in requests', code: 400, title: 'Bad Request'}})
	} else {
		var auth_token = req.headers['x-auth-token']
		//req.auth_token = req.headers['x-auth-token']

		// Search info of auth token and include pep proxy
		search_auth_token(auth_token).then(function(pep_proxy) {
			req.pep_proxy = pep_proxy
			next()
		}).catch(function(error) {
			debug("Error: " + error)
			if (!error.error) {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
			res.status(error.error.code).json(error)
		})
	}
}

// GET /access-tokens/:oauth_token -- Get info from a token
exports.info_token = function(req, res, next) {
	
	debug(' --> info_token')
	
	// Search for roles of iot agents
	if (req.token_owner.iot_id) {
		// ... search for roles of iots
	} else {

		var user = req.token_owner.user
		var app_id = req.pep_proxy.oauth_client_id
		// Search roles of user in application
		search_user_info(user, app_id).then(function(user_info) {
			res.status(201).json(user_info)
		}).catch(function(error) {
			debug("Error: " + error)
			if (!error.error) {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
			res.status(error.error.code).json(error)
		})
	}
}

// Function to search token in database
function search_auth_token(token_id) {
	
	return models.auth_token.findOne({
		where: { access_token: token_id },
		include: [{
			model: models.pep_proxy,
			attributes: ['id', 'password', 'oauth_client_id']
		}]
	}).then(function(token_info) {		
		if (token_info) {
			if ((new Date()).getTime() > token_info.expires.getTime()) {
				return Promise.reject({ error: {message: 'Auth token has expired', code: 401, title: 'Unauthorized'}})	
			}
			
			return Promise.resolve(token_info.PepProxy)
		} else {
			return Promise.reject({ error: {message: 'Auth token not found', code: 404, title: 'Not Found'}})
		}
	})
}

// Function to search oauth2 token in database
function search_oauth2_token(token_id) {

	return models.oauth_access_token.findOne({
		where: {access_token: token_id},
		include: [{
			model: models.user,
			attributes: ['id', 'username', 'email', 'gravatar']
		}]
	}).then(function (token_info) {
		if (token_info) {
			if ((new Date()).getTime() > token_info.expires.getTime()) {
				return Promise.reject({ error: {message: 'Oauth token has expired', code: 401, title: 'Unauthorized'}})	
			}

			var token_owner = (token_info.user_id) ? {user: token_info.User} : {iot_id: token_info.iot_id}
			token_owner['oauth_client_id'] = token_info.oauth_client_id 
			return Promise.resolve(token_owner)
		} else {
			return Promise.reject({ error: {message: 'Oauth token not found', code: 404, title: 'Not Found'}})
		}
    })
}

function search_user_info(user, app_id) {

	// Search organizations in wich user is member or owner
	var search_organizations = models.user_organization.findAll({ 
		where: { user_id: user.id },
		include: [{
			model: models.organization,
			attributes: ['id']
		}]
	})
	// Search roles for user or the organization to which the user belongs
	var search_roles = search_organizations.then(function(organizations) { 
		var search_role_organizations = []
		if (organizations.length > 0) {

			for (var i = 0; i < organizations.length; i++) {
				search_role_organizations.push({organization_id: organizations[i].organization_id, role_organization: organizations[i].role})
			}
		}
		return models.role_assignment.findAll({
			where: { [Op.or]: [{ [Op.or]: search_role_organizations}, {user_id: user.id}], 
					 oauth_client_id: app_id },
			include: [{
				model: models.user,
				attributes: ['id', 'username', 'email', 'gravatar']
			},{
				model: models.role,
				attributes: ['id', 'name']
			}, {
				model: models.organization,
				attributes: ['id', 'name', 'description', 'website']
			}]
		})
	})

	var search_authzforce = new Promise((resolve) => { resolve(); });
	if (config_authzforce) {
		search_authzforce = models.authzforce.findOne({
			where: { oauth_client_id: app_id }
		})	
	}

	return Promise.all([search_organizations, search_roles, search_authzforce]).then(function(values) {
		var role_assignment = values[1]
		
		if (role_assignment.length <= 0) {
			return Promise.reject({ error: {message: 'User is not authorized', code: 401, title: 'Unauthorized'}})
		} else {

			var user_info = { 	organizations: [], 
							displayName: user.username,
							roles: [],
							app_id: app_id,
							isGravatarEnabled: user.gravatar,
							email: user.email,
							id: user.id,
							app_azf_domain: (config_authzforce) ? values[2].az_domain : ''
						}

			for (i=0; i < role_assignment.length; i++) {

				var role = role_assignment[i].Role.dataValues

				if (!['provider', 'purchaser'].includes(role.id)) {
					if (role_assignment[i].Organization) {
						
						var organization = role_assignment[i].Organization.dataValues
						var index = user_info.organizations.map(function(e) { return e.id; }).indexOf(organization.id);

						if (index < 0) {
							organization['roles'] = [role]
							user_info.organizations.push(organization)
						} else {
							user_info.organizations[index].roles.push(role)
						}
					}


					if (role_assignment[i].User) {
						user_info.roles.push(role)
					}
				}
			}

			return Promise.resolve(user_info)

		}
	})
}
var models = require('../../models/models.js');
var uuid = require('uuid');

var debug = require('debug')('idm:api-authenticate');

var userApiController = require('../../controllers/api/users.js');
var pepProxyApiController = require('../../controllers/api/pep_proxies.js');


// Middleware to see if the token correspond to user
var is_user = function(req, res, next) {
	if (req.user) {
		next()
	} else {
		res.status(403).json({ error: {message: 'User not allow to perform the action', code: 403, title: 'Forbidden'}})
	}
}

// Middleware to check users token
var validate_token = function(req, res, next) {

	debug(' --> validate_token')

	check_validate_token_request(req).then(function(token_id) {

		return search_token(token_id).then(function(agent) { 

			if (agent._modelOptions.tableName === "pep_proxy") {
				req.pep_proxy = agent
			}

			if (agent._modelOptions.tableName === "user") {
				req.user = agent	
			}
			next()
		}).catch(function(error) {
			return Promise.reject(error) 
		})
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// Function to check if parameters exist in request
function check_validate_token_request(req) {

	return new Promise(function(resolve, reject) {
		switch(true) {
			case (['POST', 'PATCH', 'PUT'].includes(req.method) && (!req.headers['content-type'] || req.headers['content-type'] !== 'application/json')):
				reject({ error: {message: 'Missing parameter: header Content-Type: application/json', code: 400, title: 'Bad Request'}})
				break;
			case (!req.headers['x-auth-token']):
				reject({ error: {message: 'Expecting to find X-Auth-token in requests', code: 400, title: 'Bad Request'}})
				break;
			default:
				resolve(req.headers['x-auth-token'])
		}
	})
}


// GET /v1/auth/tokens -- Get info from a token
var info_token = function(req, res, next) {
	
	debug(' --> info_token')

	check_info_token_request(req).then(function(tokens) {
		res.status(201).json(tokens)
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// Function to check if parameters exist in request
function check_info_token_request(req) {

	return new Promise(function(resolve, reject) {
		switch(true) {
			case (!req.headers['x-subject-token']):
				reject({ error: {message: 'Expecting to find X-Subject-token in requests', code: 400, title: 'Bad Request'}})
				break;
			case (!req.headers['x-auth-token']):
				reject({ error: {message: 'Expecting to find X-Auth-token in requests', code: 400, title: 'Bad Request'}})
				break;
			default:
				resolve({auth: req.headers['x-auth-token'], subject: req.headers['x-subject-token']})
		}
	})
}

// POST /v1/auth/tokens -- Create a token
var create_token = function(req, res, next) {
	
	debug(' --> create_token')

	var response_methods = []

	check_create_token_request(req).then(function(checked) {	
		
		response_methods = checked

		var methods = []

		// Check what methods are included in the request
		if (checked.includes('password')) {
			methods.push(search_identity(req.body.name, req.body.password))
		}
		if (checked.includes('token')) {
			methods.push(search_token(req.body.token))
		}

		return Promise.all(methods)
				.then(function(values) {

					if (methods.length === 2) {
						if (values[0].id !== values[1].id) {
							return Promise.reject({ error: {message: 'Token not correspond to user', code: 401, title: 'Unauthorized'}})
						}
					}
					return Promise.resolve(values)
				}).catch(function(error) { return Promise.reject(error) })

	}).then(function(authenticated) {
		
		var token_id = uuid.v4()
		var expires = new Date((new Date()).getTime() + 1000*3600)
		var row = {access_token: token_id, expires: expires, valid: true}
		if (authenticated[0]._modelOptions.tableName === 'user') {
			row = Object.assign({}, row, { user_id: authenticated[0].id})
		} else {
			row = Object.assign({}, row, {pep_proxy_id: authenticated[0].id})
		}

		models.auth_token.create(row).then(function(auth_row) {
			var response_body = { token: { methods: response_methods, expires_at: expires}}
			res.setHeader('X-Subject-Token', token_id)
			res.status(201).json(response_body)
		}).catch(function(error) {
			debug('Error: ' + error)
			var error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			res.status(500).json(error)
		})

	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// Function to check if parameters exist in request
function check_create_token_request(req) {
	return new Promise(function(resolve, reject) {
		
		if (!req.headers['content-type'] || req.headers['content-type'] !== 'application/json') {
			reject({ error: {message: 'Missing parameter: header Content-Type: application/json', code: 400, title: 'Bad Request'}})	
		}

		var methods = []

		if (req.body.name && req.body.password) {
			methods.push('password')
		} 

		if (req.body.token) {
			methods.push('token')
		}

		if (methods.length <= 0) {
			reject({ error: {message: 'Expecting to find name and password or token in body request', code: 400, title: 'Bad Request'}})
		} else {
			resolve(methods)
		}
	})
}


// Function to check password method parameter for identity
function search_identity(name, password) {
	debug(name)
	debug(password)
	return new Promise(function(resolve, reject) {

		models.helpers.search_pep_or_user(name).then(function(identity) {

			if (identity.length <= 0) {
				reject({ error: {message: 'User not found', code: 404, title: 'Not Found'}})
			} else {
				if (identity[0].Source === 'user') {
					authenticate_user(name, password)
						.then(function(values) { resolve(values) })
						.catch(function(error) { reject(error) })
				} else if (identity[0].Source === 'pep_proxy') {
					authenticate_pep_proxy(name, password)
						.then(function(values) { resolve(values) })
						.catch(function(error) { reject(error) })
				}
			}
		}).catch(function(error) {
			reject(error)
		})
	})
}

// Authenticate user
function authenticate_user(email, password) {

	return new Promise(function(resolve, reject) { 

		userApiController.authenticate(email, password, function(error, user) {
			if (error) { 
				if (error.message === 'invalid') {
	            	reject({ error: {message: 'Invalid email or password', code: 401, title: 'Unauthorized'}})
				} else {
					reject({ error: {message: 'Internal error', code: 500, title: 'Internal error'}})
				}
	        } else {
				resolve(user)         
	        }
		});
	})

}

// Authenticate pep proxy
function authenticate_pep_proxy(id, password) {

	return new Promise(function(resolve, reject) { 
		pepProxyApiController.authenticate(id, password, function(error, pep_proxy) {
			if (error) {  
				if (error.message === 'invalid') {
	            	reject({ error: {message: 'Invalid id or password', code: 401, title: 'Unauthorized'}})
				} else {
					reject({ error: {message: 'Internal error', code: 500, title: 'Internal error'}})
				}
	        } else {
				resolve(pep_proxy)         
	        }

		});
	})
}


// Function to search token in database
function search_token(token_id) {
	
	return models.auth_token.findOne({
		where: { access_token: token_id },
		include: [{
			model: models.user,
			attributes: ['id', 'username', 'email', 'date_password', 'enabled', 'admin']
		}, {
			model: models.pep_proxy,
			attributes: ['id']
		}]
	}).then(function(token_row) {
	
		if (token_row) {
			if ((new Date()).getTime() > token_row.expires.getTime()) {
				return Promise.reject({ error: {message: 'Token has expired', code: 401, title: 'Unauthorized'}})	
			}

			var token_owner = (token_row.User) ? token_row.User : token_row.PepProxy

			return Promise.resolve(token_owner)
		} else {
			return Promise.reject({ error: {message: 'Token not found', code: 404, title: 'Not Found'}})
		}
	}).catch(function(error) {
		return Promise.reject(error)
	})
}

// Function to check if an array contains all elments of the other
function arrayContainsArray (superset, subset) {
	
	if (!Array.isArray(subset)) {
		return false;
	}

	if (0 === subset.length) {
		return false;
	}
	return subset.every(function (value) {
		return (superset.indexOf(value) >= 0);
	});
}

module.exports = {
	validate_token: validate_token,
	create_token: create_token,
	info_token: info_token,
	is_user: is_user
}
var models = require('../../models/models.js');
var uuid = require('uuid');

var config = require('../../config').database;

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var sequelize = new Sequelize(config.database, config.username, config.password, 
  { 
    host: config.host,
    dialect: config.dialect
  }      
);

var debug = require('debug')('idm:api-authenticate');

// ESTA AUTENTICACION SE DEBERIA AHCER CON LOS CONTROLLERS DE LA API Y NO LOS DE LA WEB
var userController = require('../../controllers/web/users.js');
var pepProxyController = require('../../controllers/web/pep_proxies.js');


// Middleware to see if the token correspond to user
var is_user = function(req, res, next) {
	if (req.user_id) {
		next()
	} else {
		res.status(401).json({ error: {message: 'You are not allow to perform the action', code: 401, title: 'Unauthorized'}})
	}
}

// Middleware to check users token
var validate_token = function(req, res, next) {

	debug(' --> validate_token')

	check_validate_token_request(req).then(function(token_id) {

		return authenticate_token(token_id).then(function(agent) { 
			if (agent.pep_proxy_id) {
				req.pep_proxy_id = agent.pep_proxy_id
			}

			if (agent.user_id) {
				req.user_id = agent.user_id	
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

	check_create_token_request(req).then(function(checked) {	

		// Check what methods are included in the request
		var methods = []
		if (req.body.auth.identity.methods.includes('password')) {
			methods.push(search_user(req))
		}
		if (req.body.auth.identity.methods.includes('token')) {
			methods.push(search_token(req))
		}

		return Promise.all(methods)
				.then(function(values) {
					if (methods.length === 2) {
						var passw_user = values[0][Object.keys(values[0])[0]]
						var token_user = values[1][Object.keys(values[1])[0]]
						if (passw_user !== token_user) {
							return Promise.reject({ error: {message: 'Token not correspond to user', code: 401, title: 'Unauthorized'}})
						}
					}
					return Promise.resolve(values)
				}).catch(function(error) { return Promise.reject(error) })

	}).then(function(authenticated) {
		
		var token_id = uuid.v4()
		var expires = new Date((new Date()).getTime() + 1000*3600)
		var row = {access_token: token_id, expires: expires, valid: true}
		row = Object.assign({}, row, authenticated[0])

		models.auth_token.create(row).then(function(auth_row) {
			var response_body = { token: { methods: req.body.auth.identity.methods, expires_at: expires}}
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
		switch(true) {
			case (!req.headers['content-type'] || req.headers['content-type'] !== 'application/json'):
				reject({ error: {message: 'Missing parameter: header Content-Type: application/json', code: 400, title: 'Bad Request'}})
				break;
			case (!req.body.auth):
				reject({ error: {message: 'Expecting to find auth in request body', code: 400, title: 'Bad Request'}})
				break;
			case (!req.body.auth.identity):
				reject({ error: {message: 'Expecting to find identity in request body', code: 400, title: 'Bad Request'}})
				break;
			case (!req.body.auth.identity.methods || !arrayContainsArray(['password', 'token'], req.body.auth.identity.methods)):
				reject({ error: {message: 'Expecting to find methods password or token in request body', code: 400, title: 'Bad Request'}})
				break;
			default:
				resolve(req.body.auth.identity.methods)
		}
	})
}


// Function to check password method parameter for user an see if user exists
function search_user(req) {
	
	return new Promise(function(resolve, reject) {

		if (!req.body.auth.identity.password) {
			reject({ error: {message: 'Expecting to find password in request body', code: 400, title: 'Bad Request'}})
		}

		var user = req.body.auth.identity.password.user

		if (!user) {
			reject({ error: {message: 'Expecting to find user in request body', code: 400, title: 'Bad Request'}})
		}
		if (!user.name || !user.password) {
			reject({ error: {message: 'Expecting to find name and password in request body', code: 400, title: 'Bad Request'}})
		}

		var query = `SELECT email, 'user' as Source FROM user WHERE email=:email
					 UNION ALL
					 SELECT id, 'pep_proxy' as Source FROM pep_proxy WHERE id=:email;`

		sequelize.query(query, {replacements: {email: user.name}, type: Sequelize.QueryTypes.SELECT}).then(function(row){
			if (row.length <= 0) {
				reject({ error: {message: 'User not found', code: 404, title: 'Not Found'}})
			} else {
				if (row[0].Source === 'user') {
					authenticate_user(user.name, user.password)
						.then(function(values) { resolve(values) })
						.catch(function(error) { reject(error) })
				} else if (row[0].Source === 'pep_proxy') {
					authenticate_pep_proxy(user.name, user.password)
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
		userController.authenticate(email, password, function(error, user) {
			if (error) { 
				if (error.message === 'invalid') {
	            	reject({ error: {message: 'Invalid email or password', code: 401, title: 'Unauthorized'}})
				} else {
					reject({ error: {message: 'Internal error', code: 500, title: 'Internal error'}})
				}
	        } else {
				resolve({ user_id: user.id})         
	        }
		});
	})

}

// Authenticate pep proxy
function authenticate_pep_proxy(id, password) {

	return new Promise(function(resolve, reject) { 
		pepProxyController.authenticate(id, password, function(error, pep_proxy) {
			if (error) {  
				if (error.message === 'invalid') {
	            	reject({ error: {message: 'Invalid id or password', code: 401, title: 'Unauthorized'}})
				} else {
					reject({ error: {message: 'Internal error', code: 500, title: 'Internal error'}})
				}
	        } else {
				resolve({ pep_proxy_id: pep_proxy.id})         
	        }

		});
	})
}


// Function to check token method parameter
function search_token(req) {

	return new Promise(function(resolve, reject) {
		if (!req.body.auth.identity.token) {
			reject({ error: {message: 'Expecting to find token in request body', code: 400, title: 'Bad Request'}})
		}

		var token_id = req.body.auth.identity.token.id

		if (!token_id) {
			reject({ error: {message: 'Expecting to find id of token in request body', code: 400, title: 'Bad Request'}})
		}

		authenticate_token(token_id).then(function(user_id) { resolve(user_id) }).catch(function(error) { reject(error) })
	})	
}

// Function to search token in database
function authenticate_token(token_id) {
	
	return models.auth_token.findOne({
		where: { access_token: token_id }
	}).then(function(token_row) {		
		if (token_row) {
			if ((new Date()).getTime() > token_row.expires.getTime()) {
				return Promise.reject({ error: {message: 'Token has expired', code: 401, title: 'Unauthorized'}})	
			}
			var token_owner = (token_row.user_id) ? {user_id: token_row.user_id} : {pep_proxy_id: token_row.pep_proxy_id} 
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
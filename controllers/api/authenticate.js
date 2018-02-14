var models = require('../../models/models.js');
var uuid = require('uuid');

var config = require('../../config').database;

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var sequelize = new Sequelize(config.name, config.user, config.password, 
  { 
    host: config.host,
    dialect: 'mysql'
  }      
);

var debug = require('debug')('idm:api-authenticate');

var userController = require('../../controllers/user_controller.js');
var pepProxyController = require('../../controllers/pep_proxy_controller.js');

// Middleware to check users token
var validate_token = function(req, res, next) {

	debug(' --> validate_token')

	check_validate_token_request(req).then(function(token_id) {

		return authenticate_token(token_id).then(function(user_id) { 
			req.user_id = user_id
			// METER DE ALGUNA MANERA QUE PUEDA DEIFERENCIAR ENTRE PEP PROXY Y USUARIOS
			// PARA LOS USUARIOS METERLE OTRO MIDDLEWARE DESPUES PARA COMPROBAR REQUESTE A LA API Y QUE SI ES PEP PROXY QUE NO LE DEJE
			// SE PODRIA HACER SI AL HACER LA BUSQUEDA SE LE AÑADE UN CAMPO PRA SABER SI VIENE DE LA COLUMNA DEL PEP O DEL USER
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

// POST /auth/tokens -- Create a token
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
			debug(row.length)
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
	// HABRA UQE METERLE AQUI EL INCLUDE DE PEP PROXY Y DE USER
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
			return Promise.reject({ error: {message: 'Token not found', code: 404, title: 'Unauthorized'}})
		}
	}).catch(function(error) {
		return Promise.reject(error)
	})
}

// Function to see if an array contains all elments of the other
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
	create_token: create_token
}
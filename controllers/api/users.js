var debug = require('debug')('idm:api-users');
var models = require('../../models/models.js');
var uuid = require('uuid');
var config = require('../../config');

var auth_driver = config.external_auth.enabled ?
    require('../../helpers/' + config.external_auth.authentication_driver) :
    require('../../helpers/authentication_driver');


// MW to see if user is registered
exports.authenticate = auth_driver.authenticate;

// MW to check if user is admin
exports.check_admin = function(req, res, next) {
	if (req.user.admin) {
		next()
	} else {
		res.status(404).json({error: {message: "User not authorized to perform action", code: 403, title: "Forbidden"}})
	}
}

// MW to check if user in url is the same as token owner
exports.check_user = function(req, res, next) {
	if ((req.user.id === req.params.userId) || req.user.admin) {
		next()
	} else {
		res.status(404).json({error: {message: "User not authorized to perform action", code: 403, title: "Forbidden"}})
	}
}



// GET /v1/users -- Send index of users
exports.index = function(req, res) {
	debug('--> index')
	
	models.user.findAll({
		attributes: ['id', 
					 'username', 
					 'email', 
					 'enabled', 
					 'gravatar', 
					 'date_password', 
					 'description', 
					 'website']
	}).then(function(users) {
		if (users.length > 0)
			res.status(201).json({users: users});
		else {
			res.status(404).json({error: {message: "Users not found", code: 404, title: "Bad Request"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)	
	})
}

// POST /v1/users -- Create user
exports.create = function(req, res) {
	debug('--> create')
	
	check_create_body_request(req.body).then(function(oauth_type) {
		
		var user = models.user.build(req.body.user);
		
		user.image = 'default'
		user.enabled = true
		user.id = uuid.v4()
		user.date_password = new Date((new Date()).getTime())
		return user.validate()
	}).then(function(user) {
		return user.save({fields: ['id', 
								  'username',
								  'email',
								  'password',
								  'date_password',
							      'description',
							      'website', 
							      'url',  
							      'gravatar',
							      'enabled'] })

	}).then(function(user) {
		var user = user.dataValues
		delete user.password
		res.status(201).json({user: user})
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			if (error.errors[0].message === 'emailUsed') {
				error = { error: {message: 'Email already used', code: 409, title: 'Conflict'}}
			} else if (error.errors[0].message === 'email') {
				error = { error: {message: 'Email not valid', code: 400, title: 'Bad Request'}}
			} else {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
		}
		res.status(error.error.code).json(error)
	})
}

// GET /v1/users/:userId -- Get info about user
exports.info = function(req, res) {
	debug('--> info')
	
	models.user.findOne({
		where: { id: req.params.userId },
		attributes: ['id', 
					 'username', 
					 'email', 
					 'enabled', 
					 'gravatar', 
					 'date_password', 
					 'description', 
					 'website']
	}).then(function(user) {

		if (user) {
			res.status(201).json({user: user});
		} else {
			res.status(404).json({error: {message: "User not found", code: 404, title: "Bad Request"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// PUT /v1/users/:userId -- Edit user
exports.update = function(req, res) {
	debug('--> update')
	
	var user_previous_values = null

	check_update_body_request(req.body).then(function() {
		
		return models.user.findOne({
			where: { id: req.params.userId}
		})

	}).then(function(user) {

		if (!user) {
			return Promise.reject({error: {message: "User not found", code: 404, title: "Bad Request"}})
		} else {
			user_previous_values = JSON.parse(JSON.stringify(user.dataValues))

			user.username = (req.body.user.username) ? req.body.user.username : user.username
			user.email = (req.body.user.email) ? req.body.user.email : user.email
			user.description = (req.body.user.description) ? req.body.user.description : user.description
			user.website = (req.body.user.website) ? req.body.user.website : user.website
			user.gravatar = (req.body.user.gravatar) ? req.body.user.gravatar : user.gravatar
			user.enabled = true
			if (req.body.user.password) {
				user.password = req.body.user.password
				user.date_password = new Date((new Date()).getTime()) 
			}

			return user.validate()
		}

	}).then(function(user) {

		return user.save()

	}).then(function(user) {

		delete user_previous_values.password
		delete user_previous_values.date_password
		delete user.dataValues.password
		delete user.dataValues.date_password
		var difference = diffObject(user_previous_values, user.dataValues)
		var response = (Object.keys(difference).length > 0) ? {values_updated: difference} : {message: "Request don't change the user parameters", code: 200, title: "OK"}
		res.status(200).json(response);

	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			if (error.errors[0].message === 'emailUsed') {
				error = { error: {message: 'Email already used', code: 409, title: 'Conflict'}}
			} else if (error.errors[0].message === 'email') {
				error = { error: {message: 'Email not valid', code: 400, title: 'Bad Request'}}
			} else {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
		}
		res.status(error.error.code).json(error)
	})
}

// DELETE /v1/users/:userId -- Delete user
exports.delete = function(req, res) {
	debug('--> delete')
	
	models.user.destroy({
		where: { id: req.params.userId}
	}).then(function(destroyed) {
		if (destroyed) {
			res.status(204).json("User "+req.params.userId+" destroyed");
		} else {
			return Promise.reject({error: {message: "User not found", code: 404, title: "Bad Request"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}


// Check body in create request
function check_create_body_request(body) {

	return new Promise(function(resolve, reject) {
		if (!body.user) {
			reject({error: {message: "Missing parameter user in body request", code: 400, title: "Bad Request"}})			
		}

		else if (!body.user.username) {
			reject({error: {message: "Missing parameter username in body request or empty username", code: 400, title: "Bad Request"}})
		}

		else if (!body.user.password) {
			reject({error: {message: "Missing parameter password in body request or empty password", code: 400, title: "Bad Request"}})
		}

		else if (!body.user.email) {
			reject({error: {message: "Missing parameter email in body request or empty email", code: 400, title: "Bad Request"}})
		}

		else {
			resolve()
		}
	})	
}


// Check body in update request
function check_update_body_request(body) {

	return new Promise(function(resolve, reject) {

		if (!body.user) {
			reject({error: {message: "Missing parameter user in body request", code: 400, title: "Bad Request"}})			
		}
		
		else if (body.user.id) {
			reject({error: {message: "Cannot set id", code: 400, title: "Bad Request"}})
		}

		else if (body.user.username && body.user.username.length === 0) {
			reject({error: {message: "Cannot set empty username", code: 400, title: "Bad Request"}})
		}

		else if (body.user.email && body.user.email.length === 0) {
			reject({error: {message: "Cannot set empty email", code: 400, title: "Bad Request"}})
		}

		else if (body.user.password && body.user.password.length <= 0) {
			reject({error: {message: "Cannot set empty password", code: 400, title: "Bad Request"}})
		}

		else {
			resolve()
		}
	})	
}

// Compare objects with symmetrical keys
function diffObject(a, b) {
  return Object.keys(a).reduce(function(map, k) {
    if (a[k] !== b[k]) map[k] = b[k];
    return map;
  }, {});
}
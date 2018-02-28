var debug = require('debug')('idm:api-users');
var models = require('../../models/models.js');
var uuid = require('uuid');
var config = require('../../config');

var auth_driver = config.external_auth.enabled ?
    require('../../helpers/' + config.external_auth.authentication_driver) :
    require('../../helpers/authentication_driver');


// MW to see if user is registered
exports.authenticate = auth_driver.authenticate;


// GET /v1/users -- Send index of users
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST /v1/users -- Create user
exports.create = function(req, res) {
	debug('--> create')
	res.send("ok")
}

// GET /v1/users/:userId -- Get info about user
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PUT /v1/users/:userId -- Edit user
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE /v1/users/:userId -- Delete user
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}
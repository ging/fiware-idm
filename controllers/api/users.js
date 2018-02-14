var debug = require('debug')('idm:api-users');

// GET /users -- Send index of users
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST /users -- Create user
exports.create = function(req, res) {
	debug('--> create')
	res.send("ok")
}

// GET /users/:userId -- Get info about user
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PUT /users/:userId -- Edit user
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE /users/:userId -- Delete user
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}
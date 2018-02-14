var debug = require('debug')('idm:api-permissions');

// GET /permissions -- Send index of permissions
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST /permissions -- Create permission
exports.create = function(req, res) {
	debug('--> create')
	res.send("ok")
}

// GET /permissions/:permissionId -- Get info about permission
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PATCH /permissions/:permissionId -- Edit permission
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE /permissions/:permissionId -- Delete permission
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}
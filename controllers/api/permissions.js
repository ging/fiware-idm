var debug = require('debug')('idm:api-permissions');

// GET /v1/permissions -- Send index of permissions
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST /v1/permissions -- Create permission
exports.create = function(req, res) {
	debug('--> create')
	res.send("ok")
}

// GET /v1/permissions/:permissionId -- Get info about permission
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PATCH /v1/permissions/:permissionId -- Edit permission
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE /v1/permissions/:permissionId -- Delete permission
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}
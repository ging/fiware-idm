var debug = require('debug')('idm:api-role_permission_assignments');

// GET /role_permission_assignments/:role_id/permissions -- Send index of role permissions assignments
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// PUT /role_permission_assignments/:role_id/permissions/:permission_id -- Edit role permission assignment
exports.assign = function(req, res) {
	debug('--> assign')
	res.send("ok")
}

// DELETE /role_permission_assignments/:role_id/permissions/:permission_id -- Remove role permission assignment
exports.remove = function(req, res) {
	debug('--> remove')
	res.send("ok")
}
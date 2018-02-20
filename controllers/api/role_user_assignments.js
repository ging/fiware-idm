var debug = require('debug')('idm:api-role_user_assignments');

// GET /v1/role_user_assignments/:role_id/users -- Send index of role users assignments
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// PUT /v1/role_user_assignments/:role_id/users/:user_id -- Edit role user assignment
exports.assign = function(req, res) {
	debug('--> assign')
	res.send("ok")
}

// DELETE /v1/role_user_assignments/:role_id/users/:user_id -- Remove role user assignment
exports.remove = function(req, res) {
	debug('--> remove')
	res.send("ok")
}
var debug = require('debug')('idm:api-role_organization_assignments');

// GET /role_organization_assignments/:role_id/organizations -- Send index of role organizations assignments
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// PUT /role_organization_assignments/:role_id/organizations/:organization_id -- Edit role organization assignment
exports.assign = function(req, res) {
	debug('--> assign')
	res.send("ok")
}

// DELETE /role_organization_assignments/:role_id/organizations/:organization_id -- Remove role organization assignment
exports.remove = function(req, res) {
	debug('--> remove')
	res.send("ok")
}
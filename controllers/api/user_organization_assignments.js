var debug = require('debug')('idm:api-user_organization_assignments');

// GET /user_organization_assignments/:user_id/organizations -- Send index of user organizations assignments
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// PUT /user_organization_assignments/:user_id/organizations/:organization_id -- Edit user organization assignment
exports.assign = function(req, res) {
	debug('--> assign')
	res.send("ok")
}

// DELETE /user_organization_assignments/:user_id/organizations/:organization_id -- Remove user organization assignment
exports.remove = function(req, res) {
	debug('--> remove')
	res.send("ok")
}
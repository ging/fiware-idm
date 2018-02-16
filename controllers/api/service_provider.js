var debug = require('debug')('idm:api-user_organization_assignments');

var debug = require('debug')('idm:api-user_organization_assignments');

// GET /service_providers/config -- Send general info about the idm
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}
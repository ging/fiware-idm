var debug = require('debug')('idm:api-organizations');

// GET /v1/organizations -- Send index of organizations
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST /v1/organizations -- Create organization
exports.create = function(req, res) {
	debug('--> create')
	res.send("ok")
}

// GET /v1/organizations/:organizationId -- Get info about organization
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PUT /v1/organizations/:organizationId -- Edit organization
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE /v1/organizations/:organizationId -- Delete organization
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}
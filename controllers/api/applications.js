var debug = require('debug')('idm:api-applications');

// GET /applications -- Send index of applications
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST /applications -- Create application
exports.create = function(req, res) {
	debug('--> create')
	res.send("ok")
}

// GET /applications/:applicationId -- Get info about application
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PATCH /applications/:applicationId -- Edit application
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE /applications/:applicationId -- Delete application
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}
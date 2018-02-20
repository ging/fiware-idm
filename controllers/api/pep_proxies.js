var debug = require('debug')('idm:api-pep_proxies');

// GET /v1/pep_proxies -- Send index of pep_proxies
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST v1/pep_proxies -- Create pep_proxie
exports.create = function(req, res) {
	debug('--> create')
	res.send("ok")
}

// GET v1/pep_proxies/:pep_proxyId -- Get info about pep_proxy
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PATCH v1/pep_proxies/:pep_proxyId -- Edit pep_proxy
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE v1/pep_proxies/:pep_proxyeId -- Delete pep_proxy
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}
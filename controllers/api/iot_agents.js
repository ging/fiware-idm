var debug = require('debug')('idm:api-iot_agents');

// GET /v1/iot_agents -- Send index of iot_agents
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST /v1/iot_agents -- Create iot_agent
exports.create = function(req, res) {
	debug('--> create')
	res.send("ok")
}

// GET /v1/iot_agents/:iot_agentId -- Get info about iot_agent
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PATCH /v1/iot_agents/:iot_agentId -- Edit iot_agent
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE /v1/iot_agents/:iot_agentId -- Delete iot_agent
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}
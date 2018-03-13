var debug = require('debug')('idm:api-iot_agents');
var models = require('../../models/models.js');
var uuid = require('uuid');

// MW to Autoload info if path include iotId
exports.load_iota = function(req, res, next, iotAgentId) {

    debug("--> load_iot");

    // Search application whose id is applicationId
    models.iot.findOne({
        where: { id: iotAgentId, oauth_client_id: req.application.id }
    }).then(function(iot) {
    	if (iot) {
	        req.iot = iot
	        next();
    	} else {
			res.status(404).json({error: {message: "Iot Agent not found", code: 404, title: "Not Found"}})    		
    	}
    }).catch(function(error) { 
        debug('Error: ' + error)
        if (!error.error) {
            error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
        }
        res.status(error.error.code).json(error)
    });
}

// GET /v1/:applicationId/iot_agents -- Send index of iot_agents
exports.index = function(req, res) {
	debug('--> index')
	
	models.iot.findAll({
		where: {oauth_client_id: req.application.id },
		attributes: ['id']
	}).then(function(iots) {
		if (iots.length > 0)
			res.status(201).json({iots: iots});
		else {
			res.status(404).json({error: {message: "Iot agents not found", code: 404, title: "Not Found"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
        if (!error.error) {
            error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
        }
        res.status(error.error.code).json(error)
	})
}

// POST /v1/:applicationId/iot_agents -- Create iot_agent
exports.register = function(req, res) {
	debug('--> register')
	
    // Id and password of the iot agent
    var id = 'iot_sensor_'+uuid.v4()
    var password = 'iot_sensor_'+uuid.v4()

    // Build a new row in the iot table
    var iot = models.iot.build({id: id, password: password, oauth_client_id: req.application.id});
    iot.save({
        fields: ['id','password','oauth_client_id']
    }).then(function(iot) {
        res.status(201).json({iot: {id: id, password: password}});
    }).catch(function(error) {
        debug('Error: ' + error)
        if (!error.error) {
            error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
        }
        res.status(error.error.code).json(error)
    })
}

// GET /v1/:applicationId/iot_agents/:iot_agentId -- Get info about iot_agent
exports.info = function(req, res) {
	debug('--> info')
	
   delete req.iot.dataValues.password
   res.status(201).json({iot: req.iot});
}

// PATCH /v1/:applicationId/iot_agents/:iot_agentId -- Reset iot_agent password
exports.reset_password = function(req, res) {
	debug('--> reset_password')

    var password = 'iot_sensor_'+uuid.v4()
    req.iot.password = password

    req.iot.save().then(function(iot) {

        var response = {new_password: password}
        res.status(200).json(response);

    }).catch(function(error) {
        debug('Error: ' + error)
        if (!error.error) {
            error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
        }
        res.status(error.error.code).json(error)
    })
}

// DELETE /v1/:applicationId/iot_agents/:iot_agentId -- Delete iot_agent
exports.delete = function(req, res) {
	debug('--> delete')
	
    req.iot.destroy().then(function() {
        res.status(204).json("Pep Proxy "+req.iot.id+" destroyed");
    }).catch(function(error) {
        debug('Error: ' + error)
        if (!error.error) {
            error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
        }
        res.status(error.error.code).json(error)
    })
}

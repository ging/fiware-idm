var express = require('express');
var router = express.Router();

// Iot Agent API Controller
var api_iota_controller = require('../../controllers/api/index').iot_agents;

// Routes for iot_agents
router.get('/', 				api_iota_controller.index);
router.post('/', 				api_iota_controller.create);
router.get('/:iot_agentId', 	api_iota_controller.info);
router.patch('/:iot_agentId', 	api_iota_controller.update);
router.delete('/:iot_agentId', 	api_iota_controller.delete);

module.exports = router;
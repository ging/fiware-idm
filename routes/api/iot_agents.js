var express = require('express');
var router = express.Router();

// Iot Agent API Controller
var api_iota_controller = require('../../controllers/api/index').iot_agents;

router.param(':iotAgentId', api_iota_controller.load_iota)

// Routes for pep_proxies
router.get('/', 				api_iota_controller.index);
router.post('/', 				api_iota_controller.register);
router.get('/:iotAgentId', 	api_iota_controller.info);
router.patch('/:iotAgentId', 	api_iota_controller.reset_password);
router.delete('/:iotAgentId', 	api_iota_controller.delete);

module.exports = router;
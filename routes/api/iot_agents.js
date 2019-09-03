const express = require('express');
const router = express.Router();

// Iot Agent API Controller
const api_iota_controller = require('../../controllers/api/index').iot_agents;

router.param(':iot_agent_id', api_iota_controller.load_iota);

// Routes for pep_proxies
router.get('/', api_iota_controller.index);
router.post('/', api_iota_controller.create);
router.get('/:iot_agent_id', api_iota_controller.info);
router.patch('/:iot_agent_id', api_iota_controller.update);
router.delete('/:iot_agent_id', api_iota_controller.delete);

module.exports = router;

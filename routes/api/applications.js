var express = require('express');
var router = express.Router();

// Application API Controller
var api_appl_controller = require('../../controllers/api/index').applications;

router.param('applicationId',   api_appl_controller.load_application);

// Routes for applications
router.get('/', 					api_appl_controller.index);
router.post('/', 					api_appl_controller.create);
router.get('/:applicationId', 		api_appl_controller.info);
router.patch('/:applicationId', 	api_appl_controller.update);
router.delete('/:applicationId', 	api_appl_controller.delete);

// Routes to handle roles
router.use('/:applicationId/roles',  require('./roles'))
// Routes to handle permissions
router.use('/:applicationId/permissions',  require('./permissions'))
// Routes to handle pep proxies
router.use('/:applicationId/pep_proxies',  require('./pep_proxies'))
// Routes to handle iot agents
router.use('/:applicationId/iot_agents',   require('./iot_agents'))

// Routes to handle roles permissions assignments
router.use('/:applicationId/roles',  require('./role_permission_assignments'))


module.exports = router;
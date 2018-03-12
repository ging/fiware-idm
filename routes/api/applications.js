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

module.exports = router;
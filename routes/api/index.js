var express = require('express');
var router = express.Router();

// API Controller
var apiController = require('../../controllers/api/index');
var api_authenticate_controller = require('../../controllers/api/index').authenticate;

router.use('/auth',  require('./authenticate'))
router.use('/applications', 					api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./applications'))
router.use('/users', 							api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./users'))
router.use('/organizations', 					api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./organizations'))
router.use('/roles', 							api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./roles'))
router.use('/permissions', 						api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./permissions'))
router.use('/pep_proxies', 						api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./pep_proxies'))
router.use('/iot_agents', 						api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./iot_agents'))
router.use('/role_permission_assignments', 		api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./role_permission_assignments'))
router.use('/role_user_assignments', 			api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./role_user_assignments'))
router.use('/role_organization_assignments', 	api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./role_organization_assignments'))
router.use('/user_organization_assignments', 	api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./user_organization_assignments'))
router.use('/service_providers', 				api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./service_providers'))

module.exports = router;
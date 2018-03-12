var express = require('express');
var router = express.Router();

// Role API Controller
var api_role_controller = require('../../controllers/api/index').roles;

router.param('roleId',   api_role_controller.load_role);

// Routes for roles
router.get('/', 			api_role_controller.index);
router.post('/', 			api_role_controller.create);
router.get('/:roleId', 		api_role_controller.info);
router.patch('/:roleId', 	api_role_controller.update);
router.delete('/:roleId', 	api_role_controller.delete);

module.exports = router;
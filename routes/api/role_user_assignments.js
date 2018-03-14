var express = require('express');
var router = express.Router();

// Role User Assignment API Controller
var api_role_user_assign_controller = require('../../controllers/api/index').role_user_assignments;

router.param('roleId',   require('../../controllers/api/index').roles.load_role);
router.param('userId',   require('../../controllers/api/index').users.load_user);

// Routes for role_user_assignments
router.get('/:userId/roles', 				api_role_user_assign_controller.index);
router.post('/:userId/roles/:roleId', 		api_role_user_assign_controller.assign);
router.delete('/:userId/roles/:roleId', 	api_role_user_assign_controller.remove);

module.exports = router;
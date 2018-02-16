var express = require('express');
var router = express.Router();

// Role User Assignment API Controller
var api_role_user_assign_controller = require('../../controllers/api/index').role_user_assignments;

// Routes for role_user_assignments
router.get('/:role_id/users', 				api_role_user_assign_controller.index);
router.put('/:role_id/users/:userId', 		api_role_user_assign_controller.assign);
router.delete('/:role_id/users/:userId', 	api_role_user_assign_controller.remove);

module.exports = router;
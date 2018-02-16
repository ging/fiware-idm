var express = require('express');
var router = express.Router();

// Role Permission Assignment API Controller
var api_role_pem_assign_controller = require('../../controllers/api/index').role_permission_assignments;

// Routes for role_permission_assignments
router.get('/:role_id/permissions', 					api_role_pem_assign_controller.index);
router.put('/:role_id/permissions/:permissionId', 		api_role_pem_assign_controller.assign);
router.delete('/:role_id/permissions/:permissionId', 	api_role_pem_assign_controller.remove);

module.exports = router;
var express = require('express');
var router = express.Router({mergeParams: true});

// Role Permission Assignment API Controller
var api_role_pem_assign_controller = require('../../controllers/api/index').role_permission_assignments;

router.param('roleId',   require('../../controllers/api/index').roles.load_role);
router.param('permissionId',   require('../../controllers/api/index').permissions.load_permission);

// Routes for role_permission_assignments
router.get('/:roleId/permissions', 						api_role_pem_assign_controller.index);
router.post('/:roleId/permissions/:permissionId', 		api_role_pem_assign_controller.create);
router.delete('/:roleId/permissions/:permissionId', 	api_role_pem_assign_controller.delete);

module.exports = router;
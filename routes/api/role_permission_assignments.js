const express = require('express');
const router = express.Router({ mergeParams: true }); // eslint-disable-line snakecase/snakecase

// Role Permission Assignment API Controller
const api_role_pem_assign_controller = require('../../controllers/api/index').role_permission_assignments;

router.param('role_id', require('../../controllers/api/index').roles.load_role);
router.param('permission_id', require('../../controllers/api/index').permissions.load_permission);

// Routes for role_permission_assignments
router.get('/:role_id/permissions', api_role_pem_assign_controller.index);
router.post('/:role_id/permissions/:permission_id', api_role_pem_assign_controller.create);
router.delete('/:role_id/permissions/:permission_id', api_role_pem_assign_controller.delete);

module.exports = router;

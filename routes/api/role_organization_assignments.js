const express = require('express');
const router = express.Router();

// Role Organization Assignment API Controller
const api_role_org_assign_controller = require('../../controllers/api/index').role_organization_assignments;

router.param('role_id', require('../../controllers/api/index').roles.load_role);
router.param('organization_id', require('../../controllers/api/index').organizations.load_organization);
router.param('organization_role_id', require('../../controllers/api/index').organizations.load_organization_role);

// Routes for role_organization_assignments
router.get('/', api_role_org_assign_controller.index);
router.get('/:organization_id/roles', api_role_org_assign_controller.info);
router.post(
  '/:organization_id/roles/:role_id/organization_roles/:organization_role_id',
  api_role_org_assign_controller.create
);
router.delete(
  '/:organization_id/roles/:role_id/organization_roles/:organization_role_id',
  api_role_org_assign_controller.delete
);

module.exports = router;

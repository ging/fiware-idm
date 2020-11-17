const express = require('express');
const router = express.Router();

// User Organization Assignment API Controller
const api_user_org_assign_controller = require('../../controllers/api/index').user_organization_assignments;

router.param('user_id', require('../../controllers/api/index').users.load_user);
router.param('organization_role_id', require('../../controllers/api/index').organizations.load_organization_role);

// Routes for user_organization_assignments
router.get('/', api_user_org_assign_controller.index);
router.get('/:user_id/organization_roles', api_user_org_assign_controller.info);
router.put('/:user_id/organization_roles/:organization_role_id', api_user_org_assign_controller.addRole);
router.delete('/:user_id/organization_roles/:organization_role_id', api_user_org_assign_controller.removeRole);
// POST endpoint is deprecated - maintained for backwards compatibility
router.post('/:user_id/organization_roles/:organization_role_id', api_user_org_assign_controller.addRole);

module.exports = router;

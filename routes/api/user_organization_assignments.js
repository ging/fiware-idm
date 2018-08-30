var express = require('express');
var router = express.Router();

// User Organization Assignment API Controller
var api_user_org_assign_controller = require('../../controllers/api/index').user_organization_assignments;

router.param('userId',   require('../../controllers/api/index').users.load_user);
router.param('organizationRoleId',   require('../../controllers/api/index').organizations.load_organization_role);

// Routes for user_organization_assignments
router.get('/', 							api_user_org_assign_controller.index);
router.get('/:userId/organization_roles', 						api_user_org_assign_controller.info);
router.put('/:userId/organization_roles/:organizationRoleId', 		api_user_org_assign_controller.addRole);
router.delete('/:userId/organization_roles/:organizationRoleId', 	api_user_org_assign_controller.removeRole);
// POST endpoint is deprecated - maintained for backwards compatibility
router.post('/:userId/organization_roles/:organizationRoleId', 		api_user_org_assign_controller.addRole);

module.exports = router;
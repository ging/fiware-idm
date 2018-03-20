var express = require('express');
var router = express.Router();

// Role Organization Assignment API Controller
var api_role_org_assign_controller = require('../../controllers/api/index').role_organization_assignments;

router.param('roleId',   require('../../controllers/api/index').roles.load_role);
router.param('organizationId',   require('../../controllers/api/index').organizations.load_organization);
router.param('organizationRoleId',   require('../../controllers/api/index').organizations.load_organization_role);

// Routes for role_organization_assignments
router.get('/', 																		api_role_org_assign_controller.index);
router.get('/:organizationId/roles', 													api_role_org_assign_controller.info);
router.post('/:organizationId/roles/:roleId/organization_roles/:organizationRoleId', 	api_role_org_assign_controller.create);
router.delete('/:organizationId/roles/:roleId/organization_roles/:organizationRoleId', 	api_role_org_assign_controller.delete);

module.exports = router;
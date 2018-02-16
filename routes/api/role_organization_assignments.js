var express = require('express');
var router = express.Router();

// Role Organization Assignment API Controller
var api_role_org_assign_controller = require('../../controllers/api/index').role_organization_assignments;

// Routes for role_organization_assignments
router.get('/:role_id/organizations', 						api_role_org_assign_controller.index);
router.put('/:role_id/organizations/:organizationId', 		api_role_org_assign_controller.assign);
router.delete('/:role_id/organizations/:organizationId', 	api_role_org_assign_controller.remove);

module.exports = router;
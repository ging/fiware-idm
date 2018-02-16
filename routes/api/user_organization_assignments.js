var express = require('express');
var router = express.Router();

// User Organization Assignment API Controller
var api_user_org_assign_controller = require('../../controllers/api/index').user_organization_assignments;

// Routes for user_organization_assignments
router.get('/:user_id/organizations', 						api_user_org_assign_controller.index);
router.put('/:user_id/organizations/:organizationId', 		api_user_org_assign_controller.assign);
router.delete('/:user_id/organizations/:organizationId', 	api_user_org_assign_controller.remove);

module.exports = router;
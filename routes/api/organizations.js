var express = require('express');
var router = express.Router();

// Organization API Controller
var api_org_controller = require('../../controllers/api/index').organizations;

router.param('organizationId',   api_org_controller.load_organization);

// Routes for organizations
router.get('/', 					api_org_controller.index);
router.post('/', 					api_org_controller.create);
router.get('/:organizationId', 		api_org_controller.owned_permissions,	api_org_controller.info);
router.put('/:organizationId', 		api_org_controller.owned_permissions,	api_org_controller.update);
router.delete('/:organizationId', 	api_org_controller.owned_permissions,	api_org_controller.delete);

module.exports = router;
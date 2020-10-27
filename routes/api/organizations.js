const express = require('express');
const router = express.Router();

// Organization API Controller
const api_org_controller = require('../../controllers/api/index').organizations;

router.param('organization_id', api_org_controller.load_organization);

// Routes for organizations
router.get('/', api_org_controller.index);
router.post('/', api_org_controller.create);
router.get('/:organization_id', api_org_controller.owned_permissions, api_org_controller.info);
router.patch('/:organization_id', api_org_controller.owned_permissions, api_org_controller.update);
router.delete('/:organization_id', api_org_controller.owned_permissions, api_org_controller.delete);

// Routes to handle roles users assignments
router.use('/:organization_id/users', api_org_controller.owned_permissions, require('./user_organization_assignments'));

module.exports = router;

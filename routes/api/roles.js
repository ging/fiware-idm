const express = require('express');
const router = express.Router();

// Role API Controller
const api_role_controller = require('../../controllers/api/index').roles;

router.param('role_id', api_role_controller.load_role);

// Routes for roles
router.get('/', api_role_controller.index);
router.post('/', api_role_controller.create);
router.get('/:role_id', api_role_controller.info);
router.patch('/:role_id', api_role_controller.update);
router.delete('/:role_id', api_role_controller.delete);

module.exports = router;

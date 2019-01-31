const express = require('express');
const router = express.Router();

// Permission API Controller
const api_perm_controller = require('../../controllers/api/index').permissions;

router.param('permission_id', api_perm_controller.load_permission);

// Routes for permissions
router.get('/', api_perm_controller.index);
router.post('/', api_perm_controller.create);
router.get('/:permission_id', api_perm_controller.info);
router.patch('/:permission_id', api_perm_controller.update);
router.delete('/:permission_id', api_perm_controller.delete);

module.exports = router;

var express = require('express');
var router = express.Router();

// Permission API Controller
var api_perm_controller = require('../../controllers/api/index').permissions;

// Routes for permissions
router.get('/', 				api_perm_controller.index);
router.post('/', 				api_perm_controller.create);
router.get('/:permissionId', 	api_perm_controller.info);
router.patch('/:permissionId', 	api_perm_controller.update);
router.delete('/:permissionId', api_perm_controller.delete);

module.exports = router;
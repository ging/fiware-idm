var express = require('express');
var router = express.Router();

// User API Controller
var api_user_controller = require('../../controllers/api/index').users;

router.param('userId',   api_user_controller.load_user);

// Routes for users
router.get('/', 			api_user_controller.check_admin,	api_user_controller.index);
router.post('/', 			api_user_controller.check_admin,	api_user_controller.create);
router.get('/:userId', 		api_user_controller.check_user,		api_user_controller.info);
router.put('/:userId', 		api_user_controller.check_user,		api_user_controller.update);
router.delete('/:userId', 	api_user_controller.check_user,		api_user_controller.delete);

module.exports = router;
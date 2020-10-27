const express = require('express');
const router = express.Router();

// User API Controller
const api_user_controller = require('../../controllers/api/index').users;

router.param('user_id', api_user_controller.load_user);

// Routes for users
router.get('/', api_user_controller.check_admin, api_user_controller.index);
router.post('/', api_user_controller.check_admin, api_user_controller.create);
router.get('/:user_id', api_user_controller.check_user, api_user_controller.info);
router.patch('/:user_id', api_user_controller.check_user, api_user_controller.update);
router.delete('/:user_id', api_user_controller.check_user, api_user_controller.delete);

module.exports = router;

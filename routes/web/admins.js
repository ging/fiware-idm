const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrf_protection = csrf({ cookie: true });

// Home web Controller
const web_admin_controller = require('../../controllers/web/index').admins;
const web_notify_controller = require('../../controllers/web/index').notifies;
const web_list_users_controller = require('../../controllers/web/index').list_users;

// user web Controller
const web_user_controller = require('../../controllers/web/index').users;

// Autoloads
router.param('user_id', web_user_controller.load_user);

// Routes to administrators
router.get('/administrators', csrf_protection, web_admin_controller.index_administrators);
router.put('/administrators', csrf_protection, web_admin_controller.update_administrators);
router.get('/administrators/list', csrf_protection, web_admin_controller.admin_users);
router.get('/notify', csrf_protection, web_notify_controller.show_notify);
router.post('/notify', csrf_protection, web_notify_controller.send_message);
router.get('/list_users', csrf_protection, web_list_users_controller.show);
router.get('/list_users/users', csrf_protection, web_list_users_controller.index);
router.post('/list_users/users', csrf_protection, web_list_users_controller.create);
router.delete('/list_users/users', csrf_protection, web_list_users_controller.delete);
router.put('/list_users/users/:user_id/edit_info', csrf_protection, web_list_users_controller.edit_info);
router.put('/list_users/users/:user_id/change_password', csrf_protection, web_list_users_controller.change_password);
router.put('/list_users/users/:user_id/enable', csrf_protection, web_list_users_controller.enable);

module.exports = router;

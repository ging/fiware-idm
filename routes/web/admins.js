var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var bodyParser = require('body-parser');
var csrfProtection = csrf({ cookie: true })

// Home web Controller
var web_admin_controller = require('../../controllers/web/index').admins;
var web_notify_controller = require('../../controllers/web/index').notifies;

// Routes to administrators
router.get('/notify',            csrfProtection,     web_notify_controller.show_notify)
router.post('/notify',           csrfProtection,     web_notify_controller.send_message)
router.get('/administrators',    csrfProtection,     web_admin_controller.index_administrators)
router.put('/administrators',    csrfProtection,     web_admin_controller.update_administrators)
router.get('/users',       		 csrfProtection,     web_admin_controller.admin_users)
router.get('/list_users',        csrfProtection,     web_admin_controller.list_users)

module.exports = router;
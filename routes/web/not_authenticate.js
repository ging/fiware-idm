var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var bodyParser = require('body-parser');
var csrfProtection = csrf({ cookie: false })
var parseForm = bodyParser.urlencoded({ extended: false })

// Home web Controller
var web_user_controller = require('../../controllers/web/index').users;

// Routes for users creation
router.get('/sign_up', 	            csrfProtection,     web_user_controller.new);
router.post('/sign_up',             parseForm,  csrfProtection,     web_user_controller.create);
router.get('/activate',             csrfProtection,   web_user_controller.activate);
router.get('/password/request',     csrfProtection,   web_user_controller.password_request);
router.post('/password/request',    parseForm,  csrfProtection,   web_user_controller.password_send_email);
router.get('/password/reset',       csrfProtection,   web_user_controller.new_password);
router.post('/password/reset',      parseForm,  csrfProtection,   web_user_controller.change_password);
router.get('/confirmation',         csrfProtection,   web_user_controller.confirmation);
router.post('/confirmation',        parseForm,  csrfProtection,   web_user_controller.resend_confirmation);

module.exports = router;
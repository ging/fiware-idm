var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var bodyParser = require('body-parser');
var csrfProtection = csrf({ cookie: true })

// Home web Controller
var web_setting_controller = require('../../controllers/web/index').settings;
var web_session_controller = require('../../controllers/web/index').sessions;

// Routes for settings
router.get('/',                web_session_controller.password_check_date,  csrfProtection,  web_setting_controller.settings);
router.post('/password',       csrfProtection,     web_setting_controller.password);
router.post('/email',          web_session_controller.password_check_date,  csrfProtection,  web_setting_controller.email);
router.get('/email/verify',    web_session_controller.password_check_date,  csrfProtection,  web_setting_controller.email_verify);
router.delete('/cancel',       web_session_controller.password_check_date,  csrfProtection,  web_setting_controller.cancel_account);

module.exports = router;
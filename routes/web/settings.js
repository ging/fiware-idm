const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrf_protection = csrf({ cookie: true });

// Home web Controller
const web_setting_controller = require('../../controllers/web/index').settings;
const web_session_controller = require('../../controllers/web/index').sessions;

// Routes for settings
router.get('/', web_session_controller.password_check_date, csrf_protection, web_setting_controller.settings);
router.post('/password', csrf_protection, web_setting_controller.password);
router.post('/email', web_session_controller.password_check_date, csrf_protection, web_setting_controller.email);
router.get(
  '/email/verify',
  web_session_controller.password_check_date,
  csrf_protection,
  web_setting_controller.email_verify
);
router.delete(
  '/cancel',
  web_session_controller.password_check_date,
  csrf_protection,
  web_setting_controller.cancel_account
);

router.get(
  '/enable_tfa',
  web_session_controller.password_check_date,
  csrf_protection,
  web_setting_controller.enable_tfa
);
router.post(
  '/enable_tfa_verify',
  web_session_controller.password_check_date,
  csrf_protection,
  web_setting_controller.enable_tfa_verify
);
router.post(
  '/disable_tfa',
  web_session_controller.password_check_date,
  csrf_protection,
  web_setting_controller.disable_tfa
);

module.exports = router;

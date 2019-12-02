const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrf_protection = csrf({ cookie: true });

// Home web Controller
const web_session_controller = require('../../controllers/web/index').sessions;

// Routes for users sessions
router.get(
  '/login',
  csrf_protection,
  web_session_controller.login_not_required,
  web_session_controller.new
);
router.post(
  '/login',
  csrf_protection,
  web_session_controller.login_not_required,
  web_session_controller.create
);

router.post('/tfa_verify', web_session_controller.tfa_verify);

router.delete(
  '/logout',
  web_session_controller.login_required,
  web_session_controller.destroy
);
router.delete('/external_logout', web_session_controller.external_destroy);

module.exports = router;

const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrf_protection = csrf({ cookie: true });

const passport = require('passport');

// Home web Controller
const web_session_controller = require('../../controllers/web/index').sessions;
const web_sso_controller = require('../../controllers/web/index').sso;

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
router.delete(
  '/logout',
  web_session_controller.login_required,
  web_session_controller.destroy
);
router.delete('/external_logout', web_session_controller.external_destroy);

router.get('/sso/login', passport.authenticate('samlStrategy'));

router.post(
  '/sso/callback',
  passport.authenticate('samlStrategy'),
  web_sso_controller.load_user_by_email
);

module.exports = router;

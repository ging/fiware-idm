const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const config = require('../../config');

const csrf_protection = csrf({ cookie: true });

// OUATH2 Controller
const oauth_controller = require('../../controllers/oauth2/oauth2');
// SAML2 Controller
const saml2_controller = require('../../controllers/saml2/saml2');

// Routes for Oauth2
//router.get('/authenticate',    	oauth_controller.authenticate_token);
router.post('/token', oauth_controller.token);
if (config.eidas.enabled) {
  router.get(
    '/authorize',
    csrf_protection,
    oauth_controller.response_type_required,
    oauth_controller.load_application,
    saml2_controller.search_eidas_credentials,
    saml2_controller.create_auth_request,
    oauth_controller.check_user
  );
} else {
  router.get(
    '/authorize',
    csrf_protection,
    oauth_controller.response_type_required,
    oauth_controller.load_application,
    oauth_controller.check_user
  );
}
router.post(
  '/authorize',
  csrf_protection,
  oauth_controller.response_type_required,
  oauth_controller.load_application,
  oauth_controller.authenticate_user
);
router.post(
  '/enable_app',
  csrf_protection,
  oauth_controller.response_type_required,
  oauth_controller.load_application,
  oauth_controller.load_user,
  oauth_controller.enable_app
);
router.post('/revoke', oauth_controller.revoke_token);

// catch 404 and forward to error handler
router.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
router.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = router;

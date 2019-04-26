const express = require('express');
const router = express.Router();

// SAML2 Controller
const saml2_controller = require('../../controllers/saml2/saml2');
// OAUTH2 Controller
const oauth_controller = require('../../controllers/oauth2/oauth2');

// Routes for Saml2
router.post(
  '/login',
  oauth_controller.load_application,
  saml2_controller.search_eidas_credentials,
  saml2_controller.login
);

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

const express = require('express');
const router = express.Router();
const debug = require('debug')('idm:saml_model');

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
router.use(function (req, res) {
  const err = new Error('Path not Found');

  err.status = 404;
  if (req.useragent.isDesktop) {
    res.locals.error = err;
    res.render('errors/not_found');
  } else {
    res.status(404).json(err.message);
  }
});

// Error handler
/* eslint-disable no-unused-vars */
router.use(function (err, req, res, next) {
  /* eslint-enable no-unused-vars */
  debug(err);

  err.status = err.status || 500;
  // set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status);
  res.render('errors/saml');
});

module.exports = router;

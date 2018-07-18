var express = require('express');
var router = express.Router();

// SAML2 Controller
var saml2Controller = require('../../controllers/saml2/saml2');
// OAUTH2 Controller
var oauthController = require('../../controllers/oauth2/oauth2');

// Routes for Saml2
//router.post('/login',      oauthController.load_application, 	saml2Controller.search_eidas_credentials, 	saml2Controller.login);

// catch 404 and forward to error handler
router.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
router.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = router;
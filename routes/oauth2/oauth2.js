var express = require('express');
var router = express.Router();

// OUATH2 Controller
var oauthController = require('../../controllers/oauth2/oauth2');

// Routes for Oauth2
//router.get('/authenticate',    	oauthController.authenticate_token);
router.post('/token',       	oauthController.token);
router.get('/authorize', 		oauthController.response_type_required,  oauthController.load_application, 	oauthController.check_user);
router.post('/authorize', 		oauthController.response_type_required,  oauthController.load_application,	oauthController.authenticate_user);
router.post('/enable_app', 		oauthController.response_type_required,  oauthController.load_user,	oauthController.enable_app);

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
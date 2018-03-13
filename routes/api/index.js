var express = require('express');
var router = express.Router();

// API Controller
var apiController = require('../../controllers/api/index');
var api_authenticate_controller = require('../../controllers/api/index').authenticate;

// GET INFO FROM OAUTH2 TOKENS
var api_authenticate_oauth_controller = require('../../controllers/api/index').authenticate_oauth;
router.param('oauthTokenId',   api_authenticate_oauth_controller.load_oauth);
router.get('/access-tokens/:oauthTokenId', api_authenticate_oauth_controller.check_request, api_authenticate_oauth_controller.info_token);

router.use('/auth',  require('./authenticate'))
router.use('/applications', 					api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./applications'))
router.use('/users', 							api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./users'))
router.use('/organizations', 					api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./organizations'))
// router.use('/roles', 							api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./roles'))
// router.use('/permissions', 						api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./permissions'))
// router.use('/pep_proxies', 						api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./pep_proxies'))
// router.use('/iot_agents', 						api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./iot_agents'))
router.use('/role_permission_assignments', 		api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./role_permission_assignments'))
router.use('/role_user_assignments', 			api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./role_user_assignments'))
router.use('/role_organization_assignments', 	api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./role_organization_assignments'))
router.use('/user_organization_assignments', 	api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./user_organization_assignments'))
router.use('/service_providers', 				api_authenticate_controller.validate_token, api_authenticate_controller.is_user, require('./service_providers'))

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
  res.status(err.status || 500).json(err);
});


module.exports = router;
const express = require('express');
const router = express.Router();

// API Controller
const api_authenticate_controller = require('../../controllers/api/index').authenticate;

// GET INFO FROM OAUTH2 TOKENS

////////////////////////////////////////
// ToDo: Check if is deprecated. I think this is to ensure compatibility with older releases of pep proxy
const api_authenticate_oauth_controller = require('../../controllers/api/index').authenticate_oauth;
router.param('oauth_token_id', api_authenticate_oauth_controller.load_oauth);
router.get(
  '/access-tokens/:oauth_token_id',
  api_authenticate_oauth_controller.check_request,
  api_authenticate_oauth_controller.info_token
);
////////////////////////////////////////

router.use('/auth', require('./authenticate'));

router.all('*', api_authenticate_controller.validate_token, api_authenticate_controller.is_user);

router.use('/applications', require('./applications'));
router.use('/users', require('./users'));
router.use('/organizations', require('./organizations'));
router.use('/service_providers', require('./service_providers'));

router.get('/', function (req, res) {
  res.status(200).json({
    auth_url: '/v1/auth',
    access_tokens_url: '/v1/access-tokens',
    applications_url: '/v1/applications',
    organizations_url: '/v1/organizations',
    service_providers_url: '/v1/service_providers',
    users_url: '/v1/users'
  });
});
// catch 404 and forward to error handler
router.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
router.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json(err);
});

module.exports = router;

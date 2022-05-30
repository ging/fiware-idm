const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const config = require('../../config');
const debug = require('debug')('idm:oauth_model');

const csrf_protection = csrf({ cookie: true });

// OUATH2 Controller
const oauth_controller = require('../../controllers/oauth2/oauth2');
// SAML2 Controller
const saml2_controller = require('../../controllers/saml2/saml2');
// External Participant Controller
const extparticipant_controller = require('../../controllers/extparticipant/extparticipant');

// Routes for Oauth2
//router.get('/authenticate',    	oauth_controller.authenticate_token);
if (config.pr.url) {
  router.post('/token', extparticipant_controller.token, oauth_controller.token);
} else {
  router.post('/token', oauth_controller.token);
}
let authorize_chain = [csrf_protection, oauth_controller.response_type_required, oauth_controller.load_application];
if (config.eidas.enabled) {
  authorize_chain = authorize_chain.concat([
    saml2_controller.search_eidas_credentials,
    saml2_controller.create_auth_request
  ]);
}
authorize_chain.push(oauth_controller.check_user);
router.get('/authorize', ...authorize_chain);

const post_authorize_chain = [];
if (config.pr.url) {
  post_authorize_chain.push(extparticipant_controller.validate_participant);
}
router.post(
  '/authorize',
  ...post_authorize_chain,
  csrf_protection,
  oauth_controller.load_application,
  oauth_controller.response_type_required,
  oauth_controller.authenticate_user
);
router.post(
  '/enable_app',
  csrf_protection,
  oauth_controller.load_application,
  oauth_controller.response_type_required,
  oauth_controller.load_user,
  oauth_controller.enable_app
);
router.post('/revoke', oauth_controller.revoke_token);

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
  if (req.useragent.isDesktop) {
    res.locals.error = err;
    res.render('errors/oauth', {
      query: req.query,
      application: req.application
    });
  } else {
    res.send(err.message);
  }
});

module.exports = router;

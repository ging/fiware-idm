const express = require('express');
const csrf = require('csurf');
const debug = require('debug')('idm:web_index_model');

const router = express.Router();

const csrf_protection = csrf({ cookie: true });

// Create controllers
const web_session_controller = require('../../controllers/web/index').sessions;
const web_admin_controller = require('../../controllers/web/index').admins;

// MW to see if query has delete method
router.use(function (req, res, next) {
  if (req.query._method === 'DELETE') {
    req.method = 'DELETE';
    req.url = req.path;
  }
  next();
});

// Get Home Page
router.get('/', csrf_protection, function (req, res) {
  if (req.session.user) {
    res.redirect('/idm');
  } else {
    res.render('index', { errors: [], csrf_token: req.csrfToken() });
  }
});
// router.get('/', csrf_protection, function(req, res) {
//   if (req.session.user) {
//     res.redirect('/home');
//   } else {
//     res.render('index', { errors: [], csrf_token: req.csrfToken() });
//   }
// });
// //-----------------------
// router.get('/home', csrf_protection){
//   res.redirect('/home');
// }

router.get('/language', function (req, res) {
  const callback_url = req.header('Referer') || '/idm';
  res.redirect(callback_url);
});

// Routes when user is logged
//  - Create sessions for users
router.use('/auth', require('./authenticate'));

//  - Route to warn user to change password
router.get(
  '/update_password',
  web_session_controller.login_required,
  csrf_protection,
  web_session_controller.update_password
);

//  - Routes when user is logged
router.use(
  '/idm/admins',
  web_session_controller.login_required,
  web_session_controller.password_check_date,
  web_admin_controller.is_admin,
  require('./admins')
);
router.use(
  '/idm/applications',
  web_session_controller.login_required,
  web_session_controller.password_check_date,
  require('./applications')
);
router.use(
  '/idm/users',
  web_session_controller.login_required,
  web_session_controller.password_check_date,
  require('./users')
);
router.use(
  '/idm/organizations',
  web_session_controller.login_required,
  web_session_controller.password_check_date,
  require('./organizations')
);
router.use('/idm/settings', web_session_controller.login_required, require('./settings'));
router.use(
  '/idm',
  web_session_controller.login_required,
  web_session_controller.password_check_date,
  csrf_protection,
  require('./homes')
);

// -- Routes when user is not logged
router.use('/', web_session_controller.login_not_required, require('./not_authenticate'));

// catch 404 and forward to error handler
router.use(function (req, res) {
  const err = new Error('Not Found');
  err.status = 404;
  res.locals.error = err;
  res.render('errors/not_found');
});

// Error handler
/* eslint-disable no-unused-vars */
router.use(function (err, req, res, next) {
  /* eslint-enable no-unused-vars */
  debug('Error: ', err);
  if (err.code === 'EBADCSRFTOKEN') {
    err.status = 403;
    debug('invalid csrf token');
  } else {
    err.status = err.status || 500;
  }

  // set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : { message: 'internal error', status: 500 };

  // render the error page
  if (req.path.includes('/saml2/login')) {
    res.render('errors/saml');
  } else {
    res.render('errors/generic');
  }
});

module.exports = router;

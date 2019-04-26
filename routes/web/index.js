const express = require('express');
const csrf = require('csurf');

const router = express.Router();

const csrf_protection = csrf({ cookie: true });

// Create controllers
const web_session_controller = require('../../controllers/web/index').sessions;
const web_admin_controller = require('../../controllers/web/index').admins;

// MW to see if query has delete method
router.use(function(req, res, next) {
  if (req.query._method === 'DELETE') {
    req.method = 'DELETE';
    req.url = req.path;
  }
  next();
});

// Get Home Page
router.get('/', csrf_protection, function(req, res) {
  if (req.session.user) {
    res.redirect('/idm');
  } else {
    res.render('index', { errors: [], csrf_token: req.csrfToken() });
  }
});

router.get('/language', function(req, res) {
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
router.use(
  '/idm/settings',
  web_session_controller.login_required,
  require('./settings')
);
router.use(
  '/idm',
  web_session_controller.login_required,
  web_session_controller.password_check_date,
  csrf_protection,
  require('./homes')
);

// -- Routes when user is not logged
router.use(
  '/',
  web_session_controller.login_not_required,
  require('./not_authenticate')
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

  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403);
    res.send('invalid csrf token');
  } else {
    // render the error page
    res.status(err.status || 500);
    res.render('error', { errors: [] });
  }
});

module.exports = router;

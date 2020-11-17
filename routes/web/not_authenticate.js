const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrf_protection = csrf({ cookie: true });

// Home web Controller
const web_user_controller = require('../../controllers/web/index').users;

// Routes for users creation
router.get('/sign_up', csrf_protection, web_user_controller.new);
router.post('/sign_up', csrf_protection, web_user_controller.create);
router.get('/activate', csrf_protection, web_user_controller.activate);
router.get('/password/request', csrf_protection, web_user_controller.password_request);
router.post('/password/request', csrf_protection, web_user_controller.password_send_email);
router.get('/password/reset', csrf_protection, web_user_controller.new_password);
router.post('/password/reset', csrf_protection, web_user_controller.change_password);
router.get('/confirmation', csrf_protection, web_user_controller.confirmation);
router.post('/confirmation', csrf_protection, web_user_controller.resend_confirmation);

// catch 404 and forward to error handler
router.use(function (req, res) {
  const err = new Error('Not Found');
  err.status = 404;
  res.locals.error = err;
  res.render('errors/not_found');
});

module.exports = router;

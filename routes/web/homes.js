const express = require('express');
const router = express.Router();

// Home web Controller
const web_home_controller = require('../../controllers/web/index').homes;

// Routes for home
router.get('/', web_home_controller.index);
router.get('/help_about', web_home_controller.help_about);

// catch 404 and forward to error handler
router.use(function (req, res) {
  const err = new Error('Not Found');
  err.status = 404;
  res.locals.error = err;
  res.render('errors/not_found');
});

module.exports = router;

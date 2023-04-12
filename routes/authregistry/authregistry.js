const express = require('express');
const router = express.Router();
const debug = require('debug')('idm:authregistry_model');

const authregistry_controller = require('../../controllers/authregistry/authregistry');

// Routes for the Authorization Registry module
router.post('/policy', authregistry_controller.upsert_policy);
router.post('/delegation', authregistry_controller.query_evidences);

// catch 404 and forward to error handler
router.use((req, res) => {
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
router.use((err, req, res, next) => {
  /* eslint-enable no-unused-vars */
  debug(err);

  err.status = err.status || 500;
  // set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status);
  res.render('errors/generic');
});

module.exports = router;

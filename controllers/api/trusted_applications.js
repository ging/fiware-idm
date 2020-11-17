const debug = require('debug')('idm:api-trusted_applications');
const models = require('../../models/models.js');

// MW to Autoload info if path include trusted_application_id
exports.load_trusted_application = function (req, res, next, trusted_application_id) {
  debug('--> load_trusted_application');

  if (trusted_application_id === 'idm_admin_app') {
    res.status(403).json({
      error: { message: 'Not allowed', code: 403, title: 'Forbidden' }
    });
  } else {
    // Search application whose id is trusted_application_id
    models.oauth_client
      .findById(trusted_application_id)
      .then(function (trusted_application) {
        // If application exists, set image from file system
        if (trusted_application) {
          req.trusted_application = trusted_application.id;
          next();
        } else {
          res.status(404).json({
            error: {
              message: 'Application to be add as trusted not found',
              code: 404,
              title: 'Not Found'
            }
          });
        }
      })
      .catch(function (error) {
        debug('Error: ' + error);
        if (!error.error) {
          error = {
            error: {
              message: 'Internal error',
              code: 500,
              title: 'Internal error'
            }
          };
        }
        res.status(error.error.code).json(error);
      });
  }
};

// GET /v1/applications/:application_id/trusted_applications -- Send index of trusted applications
exports.index = function (req, res) {
  debug('--> index');

  models.trusted_application
    .findAll({
      where: { oauth_client_id: req.application.id },
      attributes: ['trusted_oauth_client_id']
    })
    .then(function (trusted_applications) {
      if (trusted_applications.length > 0) {
        res.status(200).json({
          trusted_applications: trusted_applications.map((id) => id.trusted_oauth_client_id)
        });
      } else {
        res.status(404).json({
          error: {
            message: 'Trusted applications nof found',
            code: 404,
            title: 'Not Found'
          }
        });
      }
    })
    .catch(function (error) {
      debug('Error: ' + error);
      if (!error.error) {
        error = {
          error: {
            message: 'Internal error',
            code: 500,
            title: 'Internal error'
          }
        };
      }
      res.status(error.error.code).json(error);
    });
};

// PUT /v1/applications/:application_id/trusted_applications/:trusted_application_id -- Add trusted application
exports.addTrusted = function (req, res) {
  debug('--> addTrusted');

  if (req.application.id === req.trusted_application) {
    res.status(400).json({
      error: { message: 'Bad request', code: 400, title: 'Bad Request' }
    });
  } else {
    models.trusted_application
      .findOrCreate({
        where: {
          oauth_client_id: req.application.id,
          trusted_oauth_client_id: req.trusted_application
        },
        defaults: {
          oauth_client_id: req.application.id,
          trusted_oauth_client_id: req.trusted_application
        }
      })
      .spread(function (assignment, created) {
        if (created) {
          res.status(201).json({
            oauth_client_id: req.application.id,
            trusted_oauth_client_id: req.trusted_application
          });
        } else {
          res.status(400).json({
            error: {
              message: 'Trusted application already added',
              code: 400,
              title: 'Bad Request'
            }
          });
        }
      })
      .catch(function (error) {
        debug('Error: ' + error);
        if (!error.error) {
          error = {
            error: {
              message: 'Internal error',
              code: 500,
              title: 'Internal error'
            }
          };
        }
        res.status(error.error.code).json(error);
      });
  }
};

// DELETE /v1/applications/:application_id/trusted_applications/:trusted_application_id -- Delete trusted application
exports.removeTrusted = function (req, res) {
  debug('--> removeTrusted');

  if (req.application.id === req.trusted_application) {
    res.status(400).json({
      error: { message: 'Bad request', code: 400, title: 'Bad Request' }
    });
  } else {
    models.trusted_application
      .destroy({
        where: {
          oauth_client_id: req.application.id,
          trusted_oauth_client_id: req.trusted_application
        }
      })
      .then(function (deleted) {
        if (deleted) {
          res.status(204).json('success');
        } else {
          res.status(400).json({
            error: {
              message: 'Application has not that trusted application added',
              code: 400,
              title: 'Bad Request'
            }
          });
        }
      })
      .catch(function (error) {
        debug('Error: ' + error);
        if (!error.error) {
          error = {
            error: {
              message: 'Internal error',
              code: 500,
              title: 'Internal error'
            }
          };
        }
        res.status(error.error.code).json(error);
      });
  }
};

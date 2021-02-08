const models = require('../../models/models.js');
const uuid = require('uuid');

const debug = require('debug')('idm:web-iot_controller');

// Autoload info if path include iot_id
exports.load_iot = function (req, res, next, iot_id) {
  debug('--> load_iot');

  // Add id of pep proxy in request
  req.iot = { id: iot_id };
  next();
};

// GET /idm/applications/:application_id/iot/register -- Register IoT sensor
exports.register_iot = function (req, res) {
  debug('--> register_iot');

  // Id and password of the sensor
  const id = 'iot_sensor_' + uuid.v4();
  const password = 'iot_sensor_' + uuid.v4();

  // Build a new row in the iot table
  const iot = models.iot.build({
    id,
    password,
    oauth_client_id: req.application.id
  });
  iot
    .save({ fields: ['id', 'password', 'oauth_client_id', 'salt'] })
    .then(function () {
      // Send message of success in create an iot sensor
      const response = {
        message: { text: ' Create IoT sensor.', type: 'success' },
        iot: { id, password }
      };

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    })
    .catch(function (error) {
      debug('Error: ', error);

      // Send message of fail when create an iot sensor
      const response = { text: ' Failed create IoT sensor.', type: 'warning' };

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    });
};

// DELETE /idm/applications/:application_id/iot/:iot_id/delete -- Delete Pep Proxy
exports.delete_iot = function (req, res) {
  debug('--> delete_iot');

  // Destroy pep proxy form table
  models.iot
    .destroy({
      where: {
        id: req.iot.id,
        oauth_client_id: req.application.id
      }
    })
    .then(function (deleted) {
      let response;

      if (deleted) {
        // Send message of success of deleting iot
        response = {
          text: ' Iot sensor was successfully deleted.',
          type: 'success'
        };
      } else {
        // Send message of fail when deleting iot
        response = { text: ' Failed deleting iot sensor', type: 'danger' };
      }

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    })
    .catch(function (error) {
      debug('Error: ', error);

      // Send message of fail when delete an iot sensor
      const response = { text: ' Failed create IoT sensor.', type: 'warning' };

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    });
};

// GET /idm/applications/:application_id/iot/:iot_id/reset_password -- Change password to Iot Sensor
exports.reset_password_iot = function (req, res) {
  debug('--> reset_password_iot');

  // New password
  const password_new = 'iot_sensor_' + uuid.v4();

  models.iot
    .update(
      { password: password_new },
      {
        fields: ['password'],
        where: {
          id: req.iot.id,
          oauth_client_id: req.application.id
        }
      }
    )
    .then(function (reseted) {
      let response;

      if (reseted[0] === 1) {
        // Send message of success changing password pep proxy
        response = {
          message: {
            text: ' Iot sensor was successfully updated.',
            type: 'success'
          },
          iot: { id: req.iot.id, password: password_new },
          application: { id: req.application.id }
        };
      } else {
        // Send message of failed when reseting iot sensor
        response = {
          text: ' Failed changing password Iot sensor',
          type: 'danger'
        };
      }

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    })
    .catch(function (error) {
      debug('Error: ', error);

      // Send message of fail when changing password to pep proxy
      const response = { text: ' Failed create IoT sensor.', type: 'warning' };

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    });
};

// Funtion to see if request is via AJAX or Browser and depending on this, send a request
function send_response(req, res, response, url) {
  if (req.xhr) {
    res.send(response);
  } else {
    if (response.message) {
      req.session.message = response.message;
    } else {
      req.session.message = response;
    }
    res.redirect(url);
  }
}

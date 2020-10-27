const models = require('../../models/models.js');
const uuid = require('uuid');

const debug = require('debug')('idm:web-pep_proxy_controller');

// Autoload info if path include pep_id
exports.load_pep = function (req, res, next, pep_id) {
  debug('--> load_pep');

  // Add id of pep proxy in request
  req.pep = { id: pep_id };
  next();
};

// GET /idm/applications/:application_id/pep/register -- Register Pep Proxy
exports.register_pep = function (req, res) {
  debug('--> register_pep');

  // Id and password of the proxy
  const id = 'pep_proxy_' + uuid.v4();
  const password = 'pep_proxy_' + uuid.v4();

  // See if the application has already assigned a pep proxy
  models.pep_proxy
    .findOne({
      where: { oauth_client_id: req.application.id }
    })
    .then(function (pep_proxy) {
      // If not create it
      if (!pep_proxy) {
        // Build a new row in the pep_proxy table
        const pep_proxy = models.pep_proxy.build({
          id,
          password,
          oauth_client_id: req.application.id
        });
        return pep_proxy.save({
          fields: ['id', 'password', 'oauth_client_id', 'salt']
        });
      }
      const response = { text: ' Pep Proxy already created.', type: 'warning' };

      // Send response depends on the type of request
      return send_response(req, res, response, '/idm/applications/' + req.application.id);
    })
    .then(function () {
      // Send message of success in create a pep proxy
      const response = {
        message: { text: ' Create Pep Proxy.', type: 'success' },
        pep: { id, password }
      };

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    })
    .catch(function (error) {
      debug('Error: ', error);

      const response = { text: ' Failed create Pep Proxy.', type: 'warning' };

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    });
};

// DELETE /idm/applications/:application_id/pep/:pep_id/delete -- Delete Pep Proxy
exports.delete_pep = function (req, res) {
  debug('--> delete_pep');

  // Destroy pep proxy form table
  models.pep_proxy
    .destroy({
      where: {
        id: req.pep.id,
        oauth_client_id: req.application.id
      }
    })
    .then(function (deleted) {
      let response;
      if (deleted) {
        // Send message of success of deleting pep proxy
        response = {
          text: ' Pep Proxy was successfully deleted.',
          type: 'success'
        };
      } else {
        // Send message of fail when deleting pep proxy
        response = { text: ' Failed deleting pep proxy', type: 'danger' };
      }

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    })
    .catch(function (error) {
      debug('Error: ', error);

      // Send message of fail when deleting pep proxy
      const response = { text: ' Failed deleting pep proxy', type: 'danger' };

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    });
};

// GET /idm/applications/:application_id/pep/:pep_id/reset_password -- Change password to Pep Proxy
exports.reset_password_pep = function (req, res) {
  debug('--> reset_password_pep');

  // New password
  const password_new = 'pep_proxy_' + uuid.v4();

  models.pep_proxy
    .update(
      { password: password_new },
      {
        fields: ['password'],
        where: {
          id: req.pep.id,
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
            text: ' Pep Proxy was successfully updated.',
            type: 'success'
          },
          pep: { id: req.pep.id, password: password_new }
        };
      } else {
        // Send message of failed when reseting iot sensor
        response = {
          text: ' Failed changing password pep proxy',
          type: 'danger'
        };
      }

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    })
    .catch(function (error) {
      debug('Error: ', error);

      // Send message of fail when changing password to pep proxy
      const response = {
        text: ' Failed changing password pep proxy',
        type: 'danger'
      };

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications/' + req.application.id);
    });
};

// MW to check pep proxy authentication
exports.authenticate = function (id, password, callback) {
  debug('--> authenticate');

  // Search the user through the email
  models.pep_proxy
    .find({
      where: {
        id
      }
    })
    .then(function (pep_proxy) {
      if (pep_proxy) {
        // Verify password
        if (pep_proxy.verifyPassword(password)) {
          callback(null, pep_proxy);
        } else {
          callback(new Error('invalid'));
        }
      } else {
        callback(new Error('pep_proxy_not_found'));
      }
    })
    .catch(function (error) {
      callback(error);
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

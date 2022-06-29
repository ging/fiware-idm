//const models = require('../../models/models.js');
//const config_service = require('../../lib/configService.js');
const hyperledger_funtion = require('../../lib/hyperledger.js');
const debug = require('debug')('idm:hyperledger_controller');
const user_controller = require('../web/users');
const clc = require('cli-color');
const invitation_ids = {};


exports.show_login_for_invitation = function (req, res) {
  debug(' --> show_login_for_invitation');
  const errors = req.session.errors || {};
  delete req.session.errors;
  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }

  if (req.session.user)
    res.redirect('/hyperledger/show-invitation')
  else
    res.render('hyperledger/login', { errors, csrf_token: req.csrfToken() });
};


exports.handler_create_invitation = function (req, res) {
  debug(' --> handler_create_invitation');

    // If inputs email or password are empty create an array of errors
  const errors = [];
  if (!req.body.email) {
    errors.push({ message: 'email' });
  }
  if (!req.body.password) {
    errors.push({ message: 'password' });
  }

  if (req.body.email && req.body.password) {
    // Authenticate user using user controller function
    user_controller.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error) {
        // If error exists send a message to /auth/login
        req.session.errors = [{ message: error.message }];
        res.redirect('/hyperledger/invitation');
        debug(error);
        return;
      }

        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          description: user.description,
          change_password: user.date_password,
          starters_tour_ended: user.starters_tour_ended,
          extra: user.extra
        };

        res.redirect('/hyperledger/show-invitation')

    });
  } else {
    debug(errors);
    // If error exists send a message to /auth/login
    req.session.errors = errors;
    res.redirect('/hyperledger/invitation');
  }
};


exports.handler_show_invitation = function (req, res) {

  debug(' --> handler_show_invitation');

  hyperledger_funtion
    .create_invitation()
    .then(function (invitation_data) {
      res.render('hyperledger/show_invitation', { invitation: JSON.parse(invitation_data) });
      debug(clc.green('The invitation has been created'));
    })
    .catch(function (error) {
      res.send(error);
      debug(clc.red(error));
    });

}


exports.handler_webhook = function (connection_id) {
  debug(' --> handler_webhook');
  hyperledger_funtion
    .accepts_connection_request(connection_id)
    .then(function (invitation_id) {
      invitation_ids[invitation_id] = connection_id;
      debug(clc.green('Connection complete'));
    })
    .catch(function (error) {
      debug(clc.red(error));
    });
};

exports.handler_polling_invitation = function (req, res) {
  debug(' --> handler_polling_invitation');
  debug(' -->' + req.query.invitation_id);
  if (Object.keys(invitation_ids).includes(req.query.invitation_id)) {
    res.send('Recibido');
  } else {
    res.send('NO');
  }
};

exports.handler_issue_credential = function (req, res) {
  // connection_id,
  // cred_def_id,
  // issuer_did,
  // schema_id,
  // schema_name,
  // schema_version
  debug(' --> handler_issue_credential');
  let connection_id = invitation_ids[req.query.invitation_id];
  hyperledger_funtion
    .issuing_credential(connection_id, req.session.user.username,req.session.user.email,req.session.user.description) //, cred_def_id, issuer_did, schema_id, schema_name, schema_version)
    .then(function () {
      res.render('hyperledger/issue_credential');
      debug(clc.green('Issue credential complete'));
    })
    .catch(function (error) {
      debug(clc.red(error));
    });
};

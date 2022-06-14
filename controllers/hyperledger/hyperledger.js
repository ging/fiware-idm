//const models = require('../../models/models.js');
//const config_service = require('../../lib/configService.js');
const hyperledger_funtion = require('../../lib/hyperledger.js');
const debug = require('debug')('idm:hyperledger_controller');
const clc = require('cli-color');
const invitation_ids = [];

exports.handler_create_invitation = function (req, res) {
  debug(' --> handler_create_invitation');
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
};
exports.handler_webhook = function (connection_id) {
  debug(' --> handler_webhook');
  hyperledger_funtion
    .accepts_connection_request(connection_id)
    .then(function (invitation_id) {
      invitation_ids.push(invitation_id);
      debug(clc.green('Connection complete'));
    })
    .catch(function (error) {
      debug(clc.red(error));
    });
};
exports.handler_polling_invitation = function (req, res) {
  debug(' --> handler_polling_invitation');
  debug(' -->' + req.query.invitation_id);
  if (invitation_ids.includes(req.query.invitation_id)) {
    res.send('Recibido');
  } else {
    res.send('NO');
  }
};
exports.handler_issue_credential = function (
  connection_id,
  cred_def_id,
  issuer_did,
  schema_id,
  schema_name,
  schema_version
) {
  debug(' --> handler_issue_credential');
  hyperledger_funtion
    .issuing_credential(connection_id, cred_def_id, issuer_did, schema_id, schema_name, schema_version)
    .then(function () {
      debug(clc.green('Issue credential complete'));
    })
    .catch(function (error) {
      debug(clc.red(error));
    });
};

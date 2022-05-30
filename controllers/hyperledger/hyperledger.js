//const models = require('../../models/models.js');
//const config_service = require('../../lib/configService.js');
const hyperledger_funtion = require('../../lib/hyperledger.js');
const debug = require('debug')('idm:hyperledger_controller');
const clc = require('cli-color');

exports.handler_create_invitation = function (req, res) {
  debug(' --> handler_create_invitation');
  hyperledger_funtion
    .create_invitation()
    .then(function (invitation_data) {
      res.send(invitation_data);
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
    .then(function () {
      debug(clc.green('Connection complete'));
    })
    .catch(function (error) {
      debug(clc.red(error));
    });
};

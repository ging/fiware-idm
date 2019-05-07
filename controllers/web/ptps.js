//const ptp = require('../../lib/ptp.js');
const models = require('../../models/models.js');

const debug = require('debug')('idm:web-ptp_controller');

// Create all rules and policies in atuhzforce and save in database
exports.submit_ptp_usage_policies = function(
  application_id,
  submit_assignment
) {
  debug('--> submit_ptp_usage_policies');

  return new Promise(function(resolve, reject) {
    // Delete roles provider and purchaser if they exist in request
    delete submit_assignment.provider;
    delete submit_assignment.purchaser;

    // Array of usage_policie ids to search info about each permission
    const usage_policies = [];

    // filter submit assignment to obtain all usage_policie ids
    for (const role in submit_assignment) {
      usage_policies.push(
        ...submit_assignment[role].filter(function(elem) {
          if (['1', '2', '3', '4', '5', '6'].includes(elem)) {
            return false;
          }
          return true;
        })
      );
    }

    // Search permissions in the database
    return models.usage_policy
      .findAll({
        where: { id: usage_policies, oauth_client_id: application_id },
      })
      .then(function(policies_info) {
        debug(policies_info);
      })
      .catch(function(error) {
        debug('Error ' + error);
        reject({
          text: ' policies search error.',
          type: 'warning',
        });
      });
  });
};

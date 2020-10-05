const ptp = require('../../lib/ptp.js');
const models = require('../../models/models.js');
const config_service = require('../../lib/configService.js');
const config_usage_control = config_service.get_config().usage_control;

const debug = require('debug')('idm:web-ptp_controller');

// Create all rules and policies in atuhzforce and save in database
exports.submit_ptp_usage_policies = function (application_id, submit_assignment) {
  debug('--> submit_ptp_usage_policies');

  if (config_usage_control.enabled) {
    return new Promise(function (resolve, reject) {
      // Delete roles provider and purchaser if they exist in request
      delete submit_assignment.provider;
      delete submit_assignment.purchaser;

      // Array of usage_policie ids to search info about each permission
      const usage_policies = [];

      // filter submit assignment to obtain all usage_policie ids
      for (const role in submit_assignment) {
        usage_policies.push(
          ...submit_assignment[role].filter(function () {
            return true;
          })
        );
      }

      let policies_info = [];
      // Search permissions in the database
      return models.usage_policy
        .findAll({
          where: { id: usage_policies, oauth_client_id: application_id }
        })
        .then(function (result) {
          policies_info = result;
          return models.ptp.findOne({
            where: { oauth_client_id: application_id },
            attributes: ['previous_job_id']
          });
        })
        .then(function (result) {
          ////// WHEN USING ROLES, CURRENTLY ALL POLICIES ARE SENDED
          /*// Object to be sent to authzforce to create policies
            const submit_ptp = {};

            // Associate permission id to it's info
            for (const role in submit_assignment) {
              for (let i = 0; i < submit_assignment[role].length; i++) {
	              if (!submit_ptp[role]) {
	                submit_ptp[role] = [];
	              }
	              const policy = policies_info.find(
	                elem => elem.id === submit_assignment[role][i]
	              );
	              submit_ptp[role].push(policy);
              }
            }*/

          return ptp.submit_policies(application_id, result ? result.previous_job_id : null, policies_info);
        })
        .then(function () {
          resolve();
        })
        .catch(function (error) {
          debug('Error ' + error);
          reject({
            text: ' policies search error.',
            type: 'warning'
          });
        });
    });
  }
  return Promise.resolve();
};

// POST /idm/applications/:application_id/job_id -- Create usage policy
exports.create_job_id = function (req, res) {
  debug('--> create_job_id');

  models.helpers.sequelize_functions
    .updateOrCreate(
      'ptp',
      {
        oauth_client_id: req.application.id
      },
      {
        oauth_client_id: req.application.id,
        previous_job_id: req.body.job_id
      }
    )
    .then(function (result) {
      debug('Result', result);
      res.status(200).json();
    })
    .catch(function (error) {
      debug('Error', error);
      res.status(500).json(error);
    });
};

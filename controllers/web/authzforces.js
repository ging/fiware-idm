const authzforce = require('../../lib/authzforce.js');
const models = require('../../models/models.js');
const config_service = require('../../lib/configService.js');
const config_authorization = config_service.get_config().authorization;

const debug = require('debug')('idm:web-authzforce_controller');

// Create all rules and policies in atuhzforce and save in database
exports.submit_authzforce_policies = function (application_id, submit_assignment) {
  debug('--> submit_authzforce_policies');
  if (config_authorization.authzforce.enabled) {
    return new Promise(function (resolve, reject) {
      // Delete roles provider and purchaser if they exist in request
      delete submit_assignment.provider;
      delete submit_assignment.purchaser;

      // Array of permission ids to search info about each permission
      const permissions = [];

      // filter submit assignment to obtain all permission ids
      for (const role in submit_assignment) {
        permissions.push(
          ...submit_assignment[role].filter(function (elem) {
            if (['1', '2', '3', '4', '5', '6'].includes(elem)) {
              return false;
            }
            return true;
          })
        );
      }

      // Search permissions in the database
      models.permission
        .findAll({
          where: { id: permissions, oauth_client_id: application_id },
          includes: ['id', 'name', 'action', 'resource', 'xml']
        })
        .then(function (permissions_info) {
          if (permissions_info.length > 0) {
            // Object to be sent to authzforce to create policies
            const submit_authzforce = {};

            // Associate permission id to it's info
            for (const role in submit_assignment) {
              for (let i = 0; i < submit_assignment[role].length; i++) {
                if (!['1', '2', '3', '4', '5', '6'].includes(submit_assignment[role][i])) {
                  if (!submit_authzforce[role]) {
                    submit_authzforce[role] = [];
                  }
                  const permission = permissions_info.find((elem) => elem.id === submit_assignment[role][i]);
                  submit_authzforce[role].push(permission);
                }
              }
            }

            // Search if application has an authzforce domain associated
            models.authzforce
              .findOne({
                where: { oauth_client_id: application_id }
              })
              .then(function (domain) {
                if (!domain) {
                  domain = { oauth_client_id: application_id };
                }

                if (submit_authzforce) {
                  // Handle equest to authzforce
                  authzforce
                    .handle(domain, submit_authzforce)
                    .then(function (authzforce_response) {
                      // Log info about request state
                      debug('DOMAIN OF APPLICATION IS: ' + authzforce_response[1].az_domain);
                      debug('POLICY ID: ' + authzforce_response[1].policy);
                      debug('VERSION OF POLICY: ' + authzforce_response[1].version_policy);
                      debug('RESPONSE CODE FROM POLICY ACTIVATION: ' + authzforce_response[2].status);

                      let type;
                      let message;
                      // Logs for authzforce policy creation or update
                      if (authzforce_response[1].status === 200) {
                        message = ' Success creating policy.';
                        type = 'success';
                      } else if (authzforce_response[1].status === 400) {
                        message = 'XACML rule bad written';
                        type = 'warning';
                      } else if (authzforce_response[1].status === 409) {
                        message = 'Error with policy version';
                        type = 'warning';
                      } else {
                        message = 'Authzforce error';
                        type = 'warning';
                      }
                      debug('Authzforce create policy: ' + message);

                      // Logs for policy activation
                      if (authzforce_response[2].status === 200) {
                        debug('Authzforce activate policy: success');
                      } else {
                        debug('Authzforce activate policy: error');
                      }

                      if (domain.az_domain) {
                        update_domain(application_id, domain, authzforce_response[1].version_policy);
                      } else {
                        create_domain(application_id, authzforce_response[1]);
                      }

                      // Send message of success of assign permissions to roles
                      resolve({ text: message, type });
                    })
                    .catch(function (error) {
                      debug('Error ' + error);
                      reject({
                        text: ' Authzforce error',
                        type: 'warning'
                      });
                    });
                } else {
                  reject({
                    text: ' invalid submit.',
                    type: 'warning'
                  });
                }
              })
              .catch(function (error) {
                debug('Error ' + error);
                reject({
                  text: ' authzforce search error.',
                  type: 'warning'
                });
              });
          } else {
            reject({ text: ' Not create rules.', type: 'warning' });
          }
        })
        .catch(function (error) {
          debug('Error ' + error);
          reject({
            text: ' permission search error.',
            type: 'warning'
          });
        });
    });
  }
  return Promise.resolve();
};

// Create row in authzforce table
function create_domain(application_id, authzforce) {
  debug('--> create_domain');

  return models.authzforce
    .create({
      az_domain: authzforce.az_domain,
      policy: authzforce.policy,
      version: authzforce.version_policy,
      oauth_client_id: application_id
    })
    .then(function () {
      debug('Success creating row in authzforce table');
    })
    .catch(function (error) {
      debug('Error: ', error);
      debug('Error creating row in authzforce table');
    });
}

// Update row in authzforce table
function update_domain(application_id, domain, version) {
  debug('--> update_domain');

  return models.authzforce
    .update(
      {
        version
      },
      {
        fields: ['version'],
        where: {
          az_domain: domain.az_domain,
          policy: domain.policy,
          oauth_client_id: application_id
        }
      }
    )
    .then(function () {
      debug('Success updating authzforce table');
    })
    .catch(function (error) {
      debug('Error: ', error);
      debug('Error updating authzforce table');
    });
}

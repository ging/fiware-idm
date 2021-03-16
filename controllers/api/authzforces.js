const authzforce = require('../../lib/authzforce.js');
const models = require('../../models/models.js');

const debug = require('debug')('idm:api-authzforce_controller');

// Create all rules and policies in atuhzforce and save in database
exports.submit_authzforce_policies = function (application_id, submit_authzforce) {
  debug('--> submit_authzforce_policies');

  return new Promise(function (resolve, reject) {
    let domain = { oauth_client_id: application_id };

    // Search if application has an authzforce domain associated
    models.authzforce
      .findOne({
        where: { oauth_client_id: application_id }
      })
      .then(function (app_domain) {
        if (app_domain) {
          domain = app_domain;
        }

        return authzforce.handle(domain, submit_authzforce);
      })
      .then(function (authzforce_response) {
        // Log info about request state
        debug('DOMAIN OF APPLICATION IS: ' + authzforce_response[1].az_domain);
        debug('POLICY ID: ' + authzforce_response[1].policy);
        debug('VERSION OF POLICY: ' + authzforce_response[1].version_policy);
        debug('RESPONSE CODE FROM POLICY ACTIVATION: ' + authzforce_response[2].status);

        const create_policy = {
          message: '',
          status: authzforce_response[1].status
        };
        const activate_policy = {
          message: '',
          status: authzforce_response[2].status
        };

        // Logs for authzforce policy creation or update
        if (authzforce_response[1].status === 200) {
          create_policy.message = ' Success creating policy.';
        } else if (authzforce_response[1].status === 400) {
          create_policy.message = 'XACML rule bad written';
        } else if (authzforce_response[1].status === 409) {
          create_policy.message = 'Error with policy version';
        } else if (authzforce_response[1].status === 404) {
          create_policy.message = 'Domain not found in authzforce service';
        } else {
          create_policy.message = 'Authzforce error';
        }
        debug('Authzforce create policy: ' + create_policy.message);

        // Logs for policy activation
        if (authzforce_response[2].status === 200) {
          activate_policy.message = 'Success';
        } else {
          activate_policy.message = 'Error';
        }

        debug('Authzforce activate policy: ' + activate_policy.message);

        if (domain.az_domain) {
          update_domain(application_id, domain, authzforce_response[1].version_policy);
        } else {
          create_domain(application_id, authzforce_response[1]);
        }

        // Send message of success in assign permissions to roles
        resolve({ create_policy, activate_policy });
      })
      .catch(function (error) {
        reject(error);
      });
  });
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

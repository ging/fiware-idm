const debug = require('debug')('idm:api-service_provider');
const models = require('../../models/models.js');

// GET /v1/service_providers/config -- Send general info about the idm
exports.info = function(req, res) {
  debug('--> info');

  const user_count = models.user.count();
  const organization_count = models.organization.count();
  const application_count = models.oauth_client.count();

  Promise.all([user_count, organization_count, application_count])
    .then(function(values) {
      const response = {
        information: {
          totalUsers: values[0],
          totalOrganizations: values[1],
          totalApplications: values[2],
        },
      };

      res.status(201).json(response);
    })
    .catch(function(error) {
      debug('Error: ' + error);
      if (!error.error) {
        error = {
          error: {
            message: 'Internal error',
            code: 500,
            title: 'Internal error',
          },
        };
      }
      res.status(error.error.code).json(error);
    });
};

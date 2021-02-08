const debug = require('debug')('idm:api-service_provider');
const models = require('../../models/models.js');

// GET /v1/service_providers/config -- Send general info about the idm
exports.info = function (req, res) {
  debug('--> info');

  const user_count = models.user.count();
  const organization_count = models.organization.count();
  const application_count = models.oauth_client.count();

  Promise.all([user_count, organization_count, application_count])
    .then(function (values) {
      const response = {
        information: {
          total_users: values[0],
          total_organizations: values[1],
          total_applications: values[2]
        }
      };

      res.status(200).json(response);
    })
    .catch(function (error) {
      debug('Error: ' + error);
      if (!error.error) {
        error = {
          error: {
            message: 'Internal error',
            code: 500,
            title: 'Internal error'
          }
        };
      }
      res.status(error.error.code).json(error);
    });
};

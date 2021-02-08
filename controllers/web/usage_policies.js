const models = require('../../models/models.js');

const debug = require('debug')('idm:web-usage_policies_controller');

// GET /idm/applications/:application_id/edit/usage_policies -- Show usage policies
exports.index = function (req, res) {
  debug('--> index');

  const search_roles = models.role.findAll({
    where: { oauth_client_id: req.application.id },
    attributes: ['id', 'name'],
    order: [['id', 'DESC']]
  });
  const search_usage_policies = models.usage_policy.findAll({
    where: { oauth_client_id: req.application.id }
  });
  const search_assignments = search_roles.then(function (roles) {
    return models.role_usage_policy.findAll({
      where: { role_id: roles.map((elem) => elem.id) }
    });
  });

  Promise.all([search_roles, search_usage_policies, search_assignments])
    .then(function (values) {
      const usage_policies = values[1];
      const role_usage_policy_assign = {};

      for (let i = 0; i < values[2].length; i++) {
        if (!role_usage_policy_assign[values[2][i].role_id]) {
          role_usage_policy_assign[values[2][i].role_id] = [];
        }
        role_usage_policy_assign[values[2][i].role_id].push(values[2][i].usage_policy_id);
      }

      res.send({
        usage_policies,
        role_usage_policy_assign
      });
    })
    .catch(function (error) {
      debug('Error: ', error);
      // Send message of fail when creating role
      res.send({
        text: 'Error searching usage_policies',
        type: 'danger'
      });
    });
};

// GET /idm/applications/:application_id/edit/usage_policies -- Create usage policy
exports.create = function (req, res) {
  debug('--> create');
  debug(req.body);
  const policies = models.usage_policy.build({
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    parameters: req.body.parameters,
    punishment: req.body.punishment ? req.body.punishment : null,
    from: req.body.from ? req.body.from : null,
    to: req.body.to ? req.body.to : null,
    odrl: req.body.odrl,
    oauth_client_id: req.application.id
  });
  return policies
    .validate()
    .then(function () {
      return policies.save();
    })
    .then(function (usage_policy) {
      res.send(usage_policy);
    })
    .catch(function (error) {
      debug('Error', error);
      const validation_errors = [];
      if (error.errors.length) {
        for (const i in error.errors) {
          validation_errors.push(error.errors[i].message);
        }
      }
      res.status(400).json(validation_errors);
    });
};

// GET /idm/applications/:application_id/edit/usage_policies/:usage_policy_id -- Edit usage policy
exports.edit = function (req, res) {
  debug(req.body);
  res.send();
};

// GET /idm/applications/:application_id/edit/usage_policies/:usage_policy_id -- Delete usage policy
exports.delete = function (req, res) {
  debug(req.body);
  res.send();
};

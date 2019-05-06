const models = require('../../models/models.js');

const debug = require('debug')('idm:web-usage_policies_controller');

// GET /idm/applications/:application_id/edit/usage_policies -- Show usage policies
exports.index = function(req, res) {
  debug('--> index');

  models.usage_policy
    .findAll({
      where: { oauth_client_id: req.application.id },
    })
    .then(function(policies) {
      res.status(200).json(policies);
    })
    .catch(function(error) {
      debug('Error: ', error);
      // Send message of fail when creating role
      res.send({
        text: 'Error searching policies',
        type: 'danger',
      });
    });

  /*const json = {
    policies: [
      {
      	id: '1',
      	name: 'count_policy1',
        description: 'noseque',
		type: 'COUNT_POLICY',
		parameters: {
			num_max_events: 200,
		},
        punishment: 'KILL_JOB',
        from: '12:00',
        to: '14:00',
      },
      {
		id: '2',
		name: 'count_policy2',
		description: 'noseque',
        type: 'COUNT_POLICY',
		parameters: {
			event_window: 15,
			unit_time: 'SECONDS',
		},
        punishment: 'UNSUBSCRIBE',
        from: '12:00',
        to: '14:00',
      },
      {
		id: '3',
		name: 'aggregation_policy2',
		description: 'noseque',
		type: 'AGGREGATION_POLICY',
		parameters: {
			aggregate_time: 10000,
			unit_time: 'SECONDS',
		},
        punishment: 'MONETIZE',
        from: '12:00',
        to: '14:00',
      },
      {
		id: '4',
		name: 'custom',
		description: 'noseque',
		type: 'CUSTOM_POLICY',
		odrl: 'custom_odrl',
      },
    ],
  };

  res.status(200).json(json);*/
};

// GET /idm/applications/:application_id/edit/usage_policies -- Create usage policy
exports.create = function(req, res) {
  const policies = models.usage_policy.build({
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    parameters: req.body.parameters,
    punishment: req.body.punishment ? req.body.punishment : null,
    from: req.body.from,
    to: req.body.to,
    odrl: req.body.odrl,
    oauth_client_id: req.application.id,
  });
  return policies
    .validate()
    .then(function() {
      return policies.save();
    })
    .then(function(usage_policy) {
      res.send(usage_policy);
    })
    .catch(function(error) {
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
exports.edit = function(req, res) {
  debug(req.body);
  res.send();
};

// GET /idm/applications/:application_id/edit/usage_policies/:usage_policy_id -- Delete usage policy
exports.delete = function(req, res) {
  debug(req.body);
  res.send();
};

// GET /idm/applications/:application_id/edit/usage_policies/:usage_policy_id -- Activate usage policies
exports.activate = function(req, res) {
  debug(req.body);
  res.send();
};

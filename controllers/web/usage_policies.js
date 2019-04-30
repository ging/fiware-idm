const models = require('../../models/models.js');

const debug = require('debug')('idm:web-usage_policies_controller');

// GET /idm/applications/:application_id/edit/usage_policies -- Show usage policies
exports.index = function(req, res) {
  debug('--> index');

  const json = {
    policies: [
      {
        rule: {
          id: '1',
          name: 'count_policy1',
          description: 'noseque',
          type: 'COUNT_POLICY',
          params: {
            num_max_events: 200,
          },
        },
        punishment: {
          type: 'KILL_JOB',
        },
        from: '12:00',
        to: '14:00',
      },
      {
        rule: {
          id: '2',
          name: 'count_policy2',
          description: 'noseque',
          type: 'COUNT_POLICY',
          params: {
            event_window: 15,
            unit_time: 'SECONDS',
          },
        },
        punishment: {
          type: 'UNSUBSCRIBE',
        },
        from: '12:00',
        to: '14:00',
      },
      {
        rule: {
          id: '3',
          name: 'aggregation_policy2',
          description: 'noseque',
          type: 'AGGREGATION_POLICY',
          params: {
            aggregate_time: 10000,
            unit_time: 'SECONDS',
          },
        },
        punishment: {
          type: 'MONETIZE',
        },
        from: '12:00',
        to: '14:00',
      },
      {
        rule: {
          id: '4',
          name: 'custom',
          description: 'noseque',
          type: 'CUSTOM',
          odrl: 'custom_odrl',
        },
      },
    ],
  };

  res.status(200).json(json);
};

// GET /idm/applications/:application_id/edit/usage_policies -- Create usage policy
exports.create = function(req, res) {
  debug(req.body);
  models.usage_policy.build({
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    /*parameters: ,*/
    punishment: req.body.punishment,
    from: req.body.from,
    to: req.body.to,
    odrl: req.body.odrl,
  });
  res.send();
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

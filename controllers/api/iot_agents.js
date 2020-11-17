const debug = require('debug')('idm:api-iot_agents');
const models = require('../../models/models.js');
const uuid = require('uuid');

// MW to Autoload info if path include iotId
exports.load_iota = function (req, res, next, iot_agent_id) {
  debug('--> load_iot');

  // Search application whose id is application_id
  models.iot
    .findOne({
      where: { id: iot_agent_id, oauth_client_id: req.application.id },
      attributes: ['id', 'password', 'oauth_client_id', 'salt']
    })
    .then(function (iot) {
      if (iot) {
        req.iot = iot;
        next();
      } else {
        res.status(404).json({
          error: {
            message: 'Iot Agent not found',
            code: 404,
            title: 'Not Found'
          }
        });
      }
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

// GET /v1/:application_id/iot_agents -- Send index of iot_agents
exports.index = function (req, res) {
  debug('--> index');

  models.iot
    .findAll({
      where: { oauth_client_id: req.application.id },
      attributes: ['id']
    })
    .then(function (iots) {
      if (iots.length > 0) {
        res.status(200).json({ iot_agents: iots });
      } else {
        res.status(404).json({
          error: {
            message: 'Iot agents not found',
            code: 404,
            title: 'Not Found'
          }
        });
      }
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

// POST /v1/:application_id/iot_agents -- Create iot_agent
exports.create = function (req, res) {
  debug('--> create');

  // Id and password of the iot agent
  const id = 'iot_sensor_' + uuid.v4();
  const password = 'iot_sensor_' + uuid.v4();

  // Build a new row in the iot table
  const iot = models.iot.build({
    id,
    password,
    oauth_client_id: req.application.id
  });
  iot
    .save({
      fields: ['id', 'password', 'salt', 'oauth_client_id']
    })
    .then(function () {
      res.status(201).json({ iot_agent: { id, password } });
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

// GET /v1/:application_id/iot_agents/:iot_agentId -- Get info about iot_agent
exports.info = function (req, res) {
  debug('--> info');

  delete req.iot.dataValues.password;
  delete req.iot.dataValues.salt;
  res.status(200).json({ iot_agent: req.iot });
};

// PATCH /v1/:application_id/iot_agents/:iot_agentId -- Reset iot_agent password
exports.update = function (req, res) {
  debug('--> update');

  const password = 'iot_sensor_' + uuid.v4();

  req.iot.password = password;

  req.iot
    .save({
      fields: ['password', 'salt']
    })
    .then(function () {
      res.status(200).json({ new_password: password });
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

// DELETE /v1/:application_id/iot_agents/:iot_agentId -- Delete iot_agent
exports.delete = function (req, res) {
  debug('--> delete');

  req.iot
    .destroy()
    .then(function () {
      res.status(204).json('Pep Proxy ' + req.iot.id + ' destroyed');
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

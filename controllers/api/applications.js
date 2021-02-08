const debug = require('debug')('idm:api-applications');
const models = require('../../models/models.js');
const diff_object = require('../../lib/object_functions.js').diff_object;
const uuid = require('uuid');
const _ = require('lodash');
const crypto = require('crypto');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const api_check_perm_controller = require('./check_permissions');

// MW to Autoload info if path include application_id
exports.load_application = function (req, res, next, application_id) {
  debug('--> load_application');

  if (application_id === 'idm_admin_app') {
    res.status(403).json({
      error: { message: 'Not allowed', code: 403, title: 'Forbidden' }
    });
  } else {
    // Search application whose id is application_id
    models.oauth_client
      .findById(application_id)
      .then(function (application) {
        // If application exists, set image from file system
        if (application) {
          req.application = application;
          return api_check_perm_controller.check_request(req, res, next);
        }
        return Promise.reject({
          error: {
            message: 'Application not found',
            code: 404,
            title: 'Not Found'
          }
        });
      })
      .then(function () {
        next();
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
  }
};

// GET /v1/applications -- Send index of applications
exports.index = function (req, res) {
  debug('--> index');

  // Search organizations in wich user is member or owner
  const search_organizations = models.user_organization.findAll({
    where: { user_id: req.token_owner.id },
    include: [
      {
        model: models.organization,
        attributes: ['id']
      }
    ]
  });
  search_organizations
    .then(function (organizations) {
      return models.role_assignment.findAll({
        where: {
          [Op.or]: [
            {
              organization_id: organizations.map((elem) => elem.organization_id)
            },
            { user_id: req.token_owner.id }
          ]
        },
        include: [
          {
            model: models.oauth_client,
            attributes: [
              'id',
              'name',
              'description',
              'image',
              'url',
              'redirect_uri',
              'redirect_sign_out_uri',
              'grant_type',
              'response_type',
              'token_types',
              'jwt_secret',
              'client_type'
            ]
          }
        ]
      });
    })
    .then(function (applications) {
      let applications_filtered = _.uniqBy(
        applications.map((elem) => elem.OauthClient.dataValues),
        'id'
      );

      applications_filtered = _.map(applications_filtered, (application) => {
        application.urls = {
          permissions_url: '/v1/applications/' + application.id + '/permissions',
          roles_url: '/v1/applications/' + application.id + '/roles',
          users_url: '/v1/applications/' + application.id + '/users',
          pep_proxies_url: '/v1/applications/' + application.id + '/pep_proxies',
          iot_agents_url: '/v1/applications/' + application.id + '/iot_agents',
          trusted_applications_url: '/v1/applications/' + application.id + '/trusted_applications'
        };
        return application;
      });

      res.status(200).json({ applications: applications_filtered });
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

// POST /v1/applications -- Create application
exports.create = function (req, res) {
  debug('--> create');

  // Build a row and validate if input values are correct (not empty) before saving values in oauth_client
  check_create_body_request(req.body)
    .then(function (oauth_type) {
      const application = models.oauth_client.build(req.body.application);

      application.image = 'default';
      application.id = uuid.v4();
      application.secret = uuid.v4();
      if (oauth_type.grant_type.length > 0) {
        application.grant_type = oauth_type.grant_type;
        application.response_type = oauth_type.response_type;
      } else {
        application.grant_type = [
          'client_credentials',
          'password',
          'implicit',
          'authorization_code',
          'hybrid',
          'refresh_token'
        ];
        application.response_type = ['code', 'token', 'none'];
      }

      application.scope = req.body.application.scope ? req.body.application.scope : null;

      if (req.body.application.token_types || (application.scope && application.scope.includes('openid'))) {
        application.jwt_secret = req.body.application.token_types.includes('jwt')
          ? crypto.randomBytes(16).toString('hex').slice(0, 16)
          : null;
      }

      const create_application = application.save({
        fields: [
          'id',
          'secret',
          'name',
          'description',
          'url',
          'redirect_uri',
          'redirect_sign_out_uri',
          'image',
          'grant_type',
          'token_types',
          'jwt_secret',
          'response_type',
          'scope'
        ]
      });

      const create_assignment = create_application.then(function (application) {
        return models.role_assignment.create({
          oauth_client_id: application.id,
          role_id: 'provider',
          user_id: req.token_owner.id
        });
      });

      return Promise.all([create_application, create_assignment])
        .then(function (values) {
          res.status(201).json({ application: values[0].dataValues });
        })
        .catch(function (error) {
          return Promise.reject(error);
        });
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

// GET /v1/applications/:application_id -- Get info about application
exports.info = function (req, res) {
  debug('--> info');

  const application = req.application.dataValues;
  application.urls = {
    permissions_url: '/v1/applications/' + application.id + '/permissions',
    roles_url: '/v1/applications/' + application.id + '/roles',
    users_url: '/v1/applications/' + application.id + '/users',
    pep_proxies_url: '/v1/applications/' + application.id + '/pep_proxies',
    iot_agents_url: '/v1/applications/' + application.id + '/iot_agents',
    trusted_applications_url: '/v1/applications/' + application.id + '/trusted_applications'
  };
  res.status(200).json({ application });
};

// PATCH /v1/applications/:application_id -- Edit application
exports.update = function (req, res) {
  debug('--> update');

  let application_previous_values = null;

  check_update_body_request(req.body)
    .then(function (oauth_type) {
      application_previous_values = JSON.parse(JSON.stringify(req.application.dataValues));

      req.application.name = req.body.application.name ? req.body.application.name : req.application.name;
      req.application.description = req.body.application.description
        ? req.body.application.description
        : req.application.description;
      req.application.url = req.body.application.url ? req.body.application.url : req.application.url;
      req.application.redirect_uri = req.body.application.redirect_uri
        ? req.body.application.redirect_uri
        : req.application.redirect_uri;
      req.application.redirect_sign_out_uri = req.body.application.redirect_sign_out_uri
        ? req.body.application.redirect_sign_out_uri
        : req.application.redirect_sign_out_uri;
      req.application.client_type = req.body.application.client_type
        ? req.body.application.client_type
        : req.application.client_type;
      req.application.scope = req.body.application.scope ? req.body.application.scope : req.application.scope;
      req.application.image = 'default';

      req.application.token_types = req.body.application.token_types
        ? req.body.application.token_types
        : req.application.token_types;

      if (req.body.application.token_types) {
        req.application.jwt_secret = req.body.application.token_types.includes('jwt')
          ? crypto.randomBytes(16).toString('hex').slice(0, 16)
          : null;
      }

      if (oauth_type) {
        req.application.grant_type = oauth_type.grant_type;
        req.application.response_type = oauth_type.response_type;
      }

      return req.application.save();
    })
    .then(function (application) {
      const difference = diff_object(application_previous_values, application.dataValues);
      const response =
        Object.keys(difference).length > 0
          ? { values_updated: difference }
          : {
              message: "Request don't change the application parameters",
              code: 200,
              title: 'OK'
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

// DELETE /v1/applications/:application_id -- Delete application
exports.delete = function (req, res) {
  debug('--> delete');

  req.application
    .destroy()
    .then(function () {
      res.status(204).json('Appication ' + req.params.application_id + ' destroyed');
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

// Check body in create request
function check_create_body_request(body) {
  debug('--> check_create_body_request');
  return new Promise(function (resolve, reject) {
    if (!body.application) {
      reject({
        error: {
          message: 'Missing parameter application in body request',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (!body.application.name) {
      reject({
        error: {
          message: 'Missing parameter name in body request or empty name',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (!body.application.redirect_uri) {
      reject({
        error: {
          message: 'Missing parameter redirect_uri in body request',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (body.application.token_types) {
      if (
        !Array.isArray(body.application.token_types) ||
        !body.application.token_types.every((r) => ['jwt', 'permanent'].includes(r))
      ) {
        reject({
          error: {
            message: 'Invalid token type in body request',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
    }

    const oauth_types = { grant_type: [], response_type: [] };

    if (body.application.grant_type) {
      if (!Array.isArray(body.application.grant_type)) {
        reject({
          error: {
            message: 'Invalid Grant Type',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
      if (body.application.grant_type.includes('client_credentials')) {
        oauth_types.grant_type.push('client_credentials');
      }
      if (body.application.grant_type.includes('password')) {
        oauth_types.grant_type.push('password');
      }
      if (body.application.grant_type.includes('authorization_code')) {
        oauth_types.grant_type.push('authorization_code');
        oauth_types.response_type.push('code');
      }
      if (body.application.grant_type.includes('implicit')) {
        oauth_types.grant_type.push('implicit');
        oauth_types.response_type.push('token');
      }
      if (body.application.grant_type.includes('hybrid')) {
        oauth_types.grant_type.push('hybrid');
      }
      if (body.application.grant_type.includes('refresh_token')) {
        oauth_types.grant_type.push('refresh_token');
      }
      if (body.application.scope && body.application.scope.includes('openid')) {
        if (!oauth_types.grant_type.includes('hybrid')) {
          oauth_types.grant_type.push('hybrid');
        }
        if (!oauth_types.response_type.includes('code')) {
          oauth_types.grant_type.push('authorization_code');
          oauth_types.response_type.push('code');
        }
        if (!oauth_types.response_type.includes('token')) {
          oauth_types.grant_type.push('implicit');
          oauth_types.response_type.push('token');
        }
        oauth_types.response_type.push('id_token');
      }
    }

    if (body.application.grant_type && oauth_types.grant_type.length <= 0) {
      reject({
        error: {
          message: 'Invalid Grant Type',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else {
      resolve(oauth_types);
    }
  });
}

// Check body in update request
function check_update_body_request(body) {
  debug('--> check_update_body_request');

  return new Promise(function (resolve, reject) {
    if (!body.application) {
      reject({
        error: {
          message: 'Missing parameter application in body request',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (body.application.name && body.application.name.length === 0) {
      reject({
        error: {
          message: 'Cannot set empty name',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (body.application.redirect_uri && body.application.redirect_uri.length === 0) {
      reject({
        error: {
          message: 'Cannot set empty redirect_uri',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (body.application.id || body.application.secret || body.application.response_type) {
      reject({
        error: {
          message: 'Cannot set id, secret or response_type',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (body.application.token_types) {
      if (
        !Array.isArray(body.application.token_types) ||
        !body.application.token_types.every((r) => ['jwt', 'permanent'].includes(r))
      ) {
        reject({
          error: {
            message: 'Invalid token type in body request',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
    }

    if (body.application.grant_type) {
      const oauth_types = { grant_type: [], response_type: [] };

      if (!Array.isArray(body.application.grant_type)) {
        reject({
          error: {
            message: 'Invalid Grant Type',
            code: 400,
            title: 'Bad Request'
          }
        });
      }

      if (body.application.grant_type.includes('client_credentials')) {
        oauth_types.grant_type.push('client_credentials');
      }
      if (body.application.grant_type.includes('password')) {
        oauth_types.grant_type.push('password');
      }
      if (body.application.grant_type.includes('authorization_code')) {
        oauth_types.grant_type.push('authorization_code');
        oauth_types.response_type.push('code');
      }
      if (body.application.grant_type.includes('implicit')) {
        oauth_types.grant_type.push('implicit');
        oauth_types.response_type.push('token');
      }
      if (body.application.grant_type.includes('hybrid')) {
        oauth_types.grant_type.push('hybrid');
      }
      if (body.application.grant_type.includes('refresh_token')) {
        oauth_types.grant_type.push('refresh_token');
      }
      if (body.application.scope && body.application.scope.includes('openid')) {
        if (!oauth_types.grant_type.includes('hybrid')) {
          oauth_types.grant_type.push('hybrid');
        }
        if (!oauth_types.response_type.includes('code')) {
          oauth_types.grant_type.push('authorization_code');
          oauth_types.response_type.push('code');
        }
        if (!oauth_types.response_type.includes('token')) {
          oauth_types.grant_type.push('implicit');
          oauth_types.response_type.push('token');
        }
        oauth_types.response_type.push('id_token');
      }

      if (oauth_types.grant_type.length <= 0) {
        reject({
          error: {
            message: 'Invalid Grant Type',
            code: 400,
            title: 'Bad Request'
          }
        });
      } else {
        resolve(oauth_types);
      }
    } else {
      resolve();
    }
  });
}

const debug = require('debug')('idm:api-permissions');
const models = require('../../models/models.js');
const diff_object = require('../../lib/object_functions.js').diff_object;
const uuid = require('uuid');

const config_service = require('../../lib/configService.js');
const config_authzforce = config_service.get_config().authorization;

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// MW to Autoload info if path include permission_id
exports.load_permission = function (req, res, next, permission_id) {
  debug('--> load_permission');

  let where = { id: permission_id, oauth_client_id: req.application.id };

  if (['1', '2', '3', '4', '5', '6'].includes(permission_id)) {
    where = { id: permission_id, is_internal: true };
  }

  // Search permission whose id is permission_id
  models.permission
    .findOne({
      where
    })
    .then(function (permission) {
      // If permission exists, set image from file system
      if (permission) {
        req.permission = permission;
        next();
      } else {
        res.status(404).json({
          error: {
            message: 'permission not found',
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

// GET /v1/:application_id/permissions -- Send index of permissions
exports.index = function (req, res) {
  debug('--> index');

  // Search organizations in wich user is member or owner
  models.permission
    .findAll({
      where: {
        [Op.or]: [{ oauth_client_id: req.application.id }, { is_internal: true }]
      },
      attributes: [
        'id',
        'name',
        'description',
        'action',
        'resource',
        'authorization_service_header',
        'use_authorization_service_header',
        'xml'
      ],
      order: [['id', 'DESC']]
    })
    .then(function (permissions) {
      if (permissions.length > 0) {
        res.status(200).json({ permissions });
      } else {
        res.status(404).json({
          error: {
            message: 'permissions not found',
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

// POST /v1/:application_id/permissions -- Create permission
exports.create = function (req, res) {
  debug('--> create');

  check_create_body_request(req.body)
    .then(function () {
      // Build a row and validate if input values are correct (not empty) before saving values in permission table
      req.body.permission.is_regex = !!req.body.permission.is_regex;
      req.body.permission.use_authorization_service_header = !!req.body.permission.use_authorization_service_header;
      const permission = models.permission.build(req.body.permission);
      permission.id = uuid.v4();
      permission.is_internal = false;
      permission.oauth_client_id = req.application.id;

      return permission.save({
        fields: [
          'id',
          'is_internal',
          'name',
          'description',
          'action',
          'resource',
          'authorization_service_header',
          'use_authorization_service_header',
          'xml',
          'is_regex',
          'oauth_client_id'
        ]
      });
    })
    .then(function (permission) {
      res.status(201).json({ permission });
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

// GET /v1/:application_id/permissions/:permission_id -- Get info about permission
exports.info = function (req, res) {
  debug('--> info');

  res.status(200).json({ permission: req.permission });
};

// PATCH /v1/:application_id/permissions/:permission_id -- Edit permission
exports.update = function (req, res) {
  debug('--> update');

  if (['1', '2', '3', '4', '5', '6'].includes(req.permission.id)) {
    res.status(403).json({
      error: { message: 'Not allowed', code: 403, title: 'Forbidden' }
    });
  } else {
    let permission_previous_values = null;

    check_update_body_request(req.body)
      .then(function () {
        permission_previous_values = JSON.parse(JSON.stringify(req.permission.dataValues));

        req.permission.name = req.body.permission.name ? req.body.permission.name : req.permission.name;
        req.permission.description = req.body.permission.description
          ? req.body.permission.description
          : req.permission.description;
        if (req.body.permission.action && req.body.permission.resource) {
          req.permission.action = req.body.permission.action;
          req.permission.resource = req.body.permission.resource;
          req.permission.xml = null;
        }
        if (req.body.permission.xml) {
          req.permission.xml = req.body.permission.xml;
          req.permission.action = null;
          req.permission.resource = null;
        }

        req.permission.is_regex = Object.prototype.hasOwnProperty.call(req.body.permission, 'is_regex')
          ? req.body.permission.is_regex
          : req.permission.is_regex;

        req.permission.use_authorization_service_header = Object.prototype.hasOwnProperty.call(
          req.body.permission,
          'use_authorization_service_header'
        )
          ? req.body.permission.use_authorization_service_header
          : req.permission.use_authorization_service_header;

        req.permission.authorization_service_header = Object.prototype.hasOwnProperty.call(
          req.body.permission,
          'authorization_service_header'
        )
          ? req.body.permission.authorization_service_header
          : req.permission.authorization_service_header;

        return req.permission.save();
      })
      .then(function (permission) {
        const difference = diff_object(permission_previous_values, permission.dataValues);
        const response =
          Object.keys(difference).length > 0
            ? { values_updated: difference }
            : {
                message: "Request don't change the permission parameters",
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
  }
};

// DELETE /v1/:application_id/permissions/:permission_id -- Delete permission
exports.delete = function (req, res) {
  debug('--> delete');

  if (['1', '2', '3', '4', '5', '6'].includes(req.permission.id)) {
    res.status(403).json({
      error: { message: 'Not allowed', code: 403, title: 'Forbidden' }
    });
  } else {
    req.permission
      .destroy()
      .then(function () {
        res.status(204).json('Permission ' + req.params.permission_id + ' destroyed');
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

// Check body in create request
function check_create_body_request(body) {
  return new Promise(function (resolve, reject) {
    if (!body.permission) {
      reject({
        error: {
          message: 'Missing parameter permission in body request',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (!body.permission.name) {
      reject({
        error: {
          message: 'Missing parameter name in body request or empty name',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (config_authzforce.level !== 'advanced' && body.permission.xml) {
      reject({
        error: {
          message: 'Idm is not configured to create XACML advanced rules',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (config_authzforce.level === 'advanced') {
      if (
        (body.permission.resource || body.permission.action || body.permission.use_authorization_service_header) &&
        body.permission.xml
      ) {
        reject({
          error: {
            message:
              'Cannot set action, resource, authorization_service_header and use_authorization_service_header at the same time as xacml rule',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
    }

    if (!(body.permission.action && body.permission.resource) && !body.permission.xml) {
      if (config_authzforce.level === 'advanced') {
        reject({
          error: {
            message: 'Set action and resource or an advanced xacml rule',
            code: 400,
            title: 'Bad Request'
          }
        });
      } else {
        reject({
          error: {
            message: 'Set action and resource',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
    }

    if (body.permission.is_regex) {
      if (typeof body.permission.is_regex !== 'boolean') {
        reject({
          error: {
            message: 'is_regex attribute must be a boolean',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
    }

    if (body.permission.use_authorization_service_header) {
      if (typeof body.permission.use_authorization_service_header !== 'boolean') {
        reject({
          error: {
            message: 'use_authorization_service_header attribute must be a boolean',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
    }
    if (body.permission.use_authorization_service_header && !body.permission.authorization_service_header) {
      reject({
        error: {
          message: 'if use_authorization_service_header is set, authorization_service_header needs to be set',
          code: 400,
          title: 'Bad Request'
        }
      });
    }
    if (!body.permission.use_authorization_service_header && body.permission.authorization_service_header) {
      reject({
        error: {
          message: 'if authorization_service_header is set, use_authorization_service_header needs to be set',
          code: 400,
          title: 'Bad Request'
        }
      });
    }
    resolve();
  });
}

// Check body in update request
function check_update_body_request(body) {
  return new Promise(function (resolve, reject) {
    if (!body.permission) {
      reject({
        error: {
          message: 'Missing parameter permission in body request',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (body.permission.name && body.permission.name.length === 0) {
      reject({
        error: {
          message: 'Cannot set empty name',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (config_authzforce.level !== 'advanced' && body.permission.xml) {
      reject({
        error: {
          message: 'Idm is not configured to create XACML advanced rules',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (body.permission.id || body.permission.is_internal) {
      reject({
        error: {
          message: 'Cannot set id or is_internal',
          code: 400,
          title: 'Bad Request'
        }
      });
    }

    if (config_authzforce.level === 'advanced') {
      if (
        (body.permission.resource || body.permission.action || body.permission.use_authorization_service_header) &&
        body.permission.xml
      ) {
        reject({
          error: {
            message:
              'Cannot set action, resource, authorization_service_header and use_authorization_service_header at the same time as xacml rule',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
    }

    if (body.permission.is_regex) {
      if (typeof body.permission.is_regex !== 'boolean') {
        reject({
          error: {
            message: 'is_regex attribute must be a boolean',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
    }

    if (body.permission.use_authorization_service_header) {
      if (typeof body.permission.use_authorization_service_header !== 'boolean') {
        reject({
          error: {
            message: 'use_authorization_service_header attribute must be a boolean',
            code: 400,
            title: 'Bad Request'
          }
        });
      }
    }
    if (body.permission.use_authorization_service_header && !body.permission.authorization_service_header) {
      reject({
        error: {
          message: 'if use_authorization_service_header is set, authorization_service_header needs to be set',
          code: 400,
          title: 'Bad Request'
        }
      });
    }
    if (!body.permission.use_authorization_service_header && body.permission.authorization_service_header) {
      reject({
        error: {
          message: 'if authorization_service_header is set, use_authorization_service_header needs to be set',
          code: 400,
          title: 'Bad Request'
        }
      });
    }
    resolve();
  });
}

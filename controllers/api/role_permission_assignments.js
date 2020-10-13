const debug = require('debug')('idm:api-role_permission_assignments');
const models = require('../../models/models.js');

const authzforce_controller = require('./authzforces');
const config_service = require('../../lib/configService.js');
const config_authzforce = config_service.get_config().authorization;

// GET /v1/applications/:application_id/roles/:role_id/permissions -- Send index of role permissions assignments
exports.index = function (req, res) {
  debug('--> index');

  models.role_permission
    .findAll({
      where: { role_id: req.role.id },
      attributes: ['role_id', 'permission_id'],
      include: [
        {
          model: models.permission,
          attributes: [
            'id',
            'is_internal',
            'name',
            'description',
            'action',
            'resource',
            'authorization_service_header',
            'use_authorization_service_header',
            'xml'
          ]
        }
      ]
    })
    .then(function (rows) {
      if (rows.length > 0) {
        res.status(200).json({
          role_permission_assignments: rows.map((elem) => elem.Permission)
        });
      } else {
        res.status(404).json({
          error: {
            message: 'Assignments not found',
            code: 404,
            title: 'Not Found'
          }
        });
      }
    })
    .catch(function (error) {
      debug('Error: ', error);
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

// POST /v1/applications/:application_id/roles/:role_id/permissions/:permission_id -- Edit role permission assignment
exports.create = function (req, res) {
  debug('--> create');

  if (req.role.id === 'provider' || req.role.id === 'purchaser') {
    res.status(403).json({
      error: { message: 'Not allowed', code: 403, title: 'Forbidden' }
    });
  } else {
    models.role_permission
      .findOrCreate({
        where: { role_id: req.role.id, permission_id: req.permission.id },
        defaults: { role_id: req.role.id, permission_id: req.permission.id }
      })
      .spread(function (assignment, created) {
        delete assignment.dataValues.id;
        if (created && config_authzforce.authzforce.enabled) {
          return search_role_permission(req.application.id)
            .then(function (role_permission_assignment) {
              if (Object.keys(role_permission_assignment).length > 0) {
                authzforce_controller
                  .submit_authzforce_policies(req.application.id, role_permission_assignment)
                  .then(function (result) {
                    res.status(201).json({
                      role_permission_assignments: assignment,
                      authzforce: result
                    });
                  })
                  .catch(function (error) {
                    Promise.reject(error);
                  });
              } else {
                res.status(201).json({ role_permission_assignments: assignment });
              }
            })
            .catch(function (error) {
              return Promise.reject(error);
            });
        }

        return res.status(201).json({ role_permission_assignments: assignment });
      })
      .catch(function (error) {
        debug('Error: ', error);
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

// DELETE /v1/applications/:application_id/roles/:role_id/permissions/:permission_id -- Remove role permission assignment
exports.delete = function (req, res) {
  debug('--> delete');

  if (req.role.id === 'provider' || req.role.id === 'purchaser') {
    res.status(403).json({
      error: { message: 'Not allowed', code: 403, title: 'Forbidden' }
    });
  } else {
    models.role_permission
      .destroy({
        where: { role_id: req.role.id, permission_id: req.permission.id }
      })
      .then(function (deleted) {
        if (deleted && config_authzforce.authzforce.enabled) {
          return search_role_permission(req.application.id)
            .then(function (role_permission_assignment) {
              if (Object.keys(role_permission_assignment).length > 0) {
                authzforce_controller
                  .submit_authzforce_policies(req.application.id, role_permission_assignment)
                  .then(function () {
                    res.status(204).json('Assignment destroyed');
                  })
                  .catch(function (error) {
                    Promise.reject(error);
                  });
              }
            })
            .catch(function (error) {
              return Promise.reject(error);
            });
        } else if (deleted && !config_authzforce.authzforce.enabled) {
          return res.status(204).json('Assignment destroyed');
        }

        return res.status(404).json({
          error: {
            message: 'Assignments not found',
            code: 404,
            title: 'Not Found'
          }
        });
      })
      .catch(function (error) {
        debug('Error: ', error);
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

// Function to search all role permission assignmnet to be send to authzforce
function search_role_permission(application_id) {
  return new Promise(function (resolve, reject) {
    const search_roles = models.role.findAll({
      where: { oauth_client_id: application_id }
    });

    const search_roles_permission_assignment = search_roles.then(function (roles) {
      return models.role_permission.findAll({
        where: { role_id: roles.map((elem) => elem.id) },
        attributes: ['role_id', 'permission_id'],
        include: [
          {
            model: models.permission,
            where: { oauth_client_id: application_id },
            attributes: [
              'id',
              'is_internal',
              'name',
              'description',
              'action',
              'resource',
              'authorization_service_header',
              'use_authorization_service_header',
              'xml'
            ]
          }
        ]
      });
    });

    search_roles_permission_assignment
      .then(function (rows) {
        const role_permission_assignment = {};

        for (let i = 0; i < rows.length; i++) {
          if (!role_permission_assignment[rows[i].role_id]) {
            role_permission_assignment[rows[i].role_id] = [];
          }

          if (!['provider', 'purchaser'].includes(rows[i].permission_id)) {
            role_permission_assignment[rows[i].role_id].push(rows[i].Permission);
          }
        }

        resolve(role_permission_assignment);
      })
      .catch(function (error) {
        debug('Error: ', error);
        reject({
          error: {
            message: 'Internal error',
            code: 500,
            title: 'Internal error'
          }
        });
      });
  });
}

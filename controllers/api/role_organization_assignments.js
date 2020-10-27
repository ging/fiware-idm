const debug = require('debug')('idm:api-role_organization_assignments');
const models = require('../../models/models.js');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// GET /v1/applications/:application_id/organizations -- Send index of role user assignment
exports.index_organizations = function (req, res) {
  debug('--> index');

  models.role_assignment
    .findAll({
      where: {
        oauth_client_id: req.application.id,
        user_id: { [Op.eq]: null },
        organization_id: { [Op.ne]: null }
      },
      attributes: ['organization_id', 'role_organization', 'role_id']
    })
    .then(function (assignments) {
      if (assignments.length > 0) {
        res.status(200).json({ role_organization_assignments: assignments });
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

// GET /v1/applications/:application_id/organizations/:organization_id/roles -- Send index of role user assignment
exports.index_organization_roles = function (req, res) {
  debug('--> info');

  models.role_assignment
    .findAll({
      where: {
        organization_id: req.organization.id,
        oauth_client_id: req.application.id
      },
      attributes: ['organization_id', 'role_id']
    })
    .then(function (rows) {
      if (req.changeable_role) {
        const changeable_role_id = req.changeable_role.map((elem) => elem.id);
        for (let i = 0; i < rows.length; i++) {
          if (!changeable_role_id.includes(rows[i].role_id)) {
            rows.splice(i, 1);
            i = i - 1;
          }
        }
      }
      if (rows.length > 0) {
        res.status(200).json({ role_organization_assignments: rows });
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

// PUT /v1/applications/:application_id/organizations/:organization_id/roles/:role_id/organization_roles/organization_role_id -- Add role organization assignment
exports.addRole = function (req, res) {
  debug('--> addRole');

  if (req.changeable_role) {
    const changeable_role_id = req.changeable_role.map((elem) => elem.id);
    if (!changeable_role_id.includes(req.role.id)) {
      return res.status(403).json({
        error: {
          message: 'User not allow to perform the action',
          code: 403,
          title: 'Forbidden'
        }
      });
    }
  }

  return models.role_assignment
    .findOrCreate({
      where: {
        role_id: req.role.id,
        organization_id: req.organization.id,
        oauth_client_id: req.application.id,
        role_organization: req.role_organization
      },
      defaults: {
        role_id: req.role.id,
        organization_id: req.organization.id,
        oauth_client_id: req.application.id,
        role_organization: req.role_organization
      }
    })
    .spread(function (assignment) {
      delete assignment.dataValues.id;
      delete assignment.dataValues.user_id;
      return res.status(201).json({ role_organization_assignments: assignment });
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

// DELETE /v1/applications/:application_id/organizations/:organization_id/roles/:role_id/organization_roles/organization_role_id -- Remove role organization assignment
exports.removeRole = function (req, res) {
  debug('--> removeRole');

  if (req.changeable_role) {
    const changeable_role_id = req.changeable_role.map((elem) => elem.id);
    if (!changeable_role_id.includes(req.role.id)) {
      return res.status(403).json({
        error: {
          message: 'User not allow to perform the action',
          code: 403,
          title: 'Forbidden'
        }
      });
    }
  }

  return models.role_assignment
    .destroy({
      where: {
        role_id: req.role.id,
        role_organization: req.role_organization,
        organization_id: req.organization.id,
        oauth_client_id: req.application.id
      }
    })
    .then(function (deleted) {
      if (deleted) {
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

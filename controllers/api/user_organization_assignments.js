const debug = require('debug')('idm:api-user_organization_assignments');
const models = require('../../models/models.js');

// GET /v1/organizations/:organization_id/users -- Send index of user organizations assignments
exports.index = function (req, res) {
  debug('--> index');

  models.user_organization
    .findAll({
      where: { organization_id: req.organization.id },
      attributes: ['user_id', 'organization_id', 'role']
    })
    .then(function (assignments) {
      if (assignments.length > 0) {
        res.status(200).json({ organization_users: assignments });
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

// GET /v1/organizations/:organization_id/users/:user_id/organization_roles -- Send index of user organizations assignments
exports.info = function (req, res) {
  debug('--> info');

  models.user_organization
    .findOne({
      where: { organization_id: req.organization.id, user_id: req.user.id },
      attributes: ['user_id', 'organization_id', 'role']
    })
    .then(function (assignment) {
      if (assignment) {
        res.status(200).json({ organization_user: assignment });
      } else {
        res.status(404).json({
          error: {
            message: 'Assignment not found',
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

// PUT /v1/organizations/:organization_id/users/:user_id/:organization_role_id -- Set user organization assignment
exports.addRole = function (req, res) {
  debug('--> setRole');

  models.user_organization
    .findOne({
      where: {
        organization_id: req.organization.id,
        user_id: req.user.id
      }
    })
    .then(function (assignment) {
      if (assignment) {
        assignment.role = req.role_organization;
        return assignment.save({ fields: ['role'] });
      }
      return models.user_organization.create({
        role: req.role_organization,
        organization_id: req.organization.id,
        user_id: req.user.id
      });
    })
    .then(function (new_assignment) {
      delete new_assignment.dataValues.id;
      res.status(201).json({ user_organization_assignments: new_assignment });
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

// DELETE /v1/user_organization_assignments/:user_id/organizations/:organization_id -- Remove user organization assignment
exports.removeRole = function (req, res) {
  debug('--> removeRole');

  models.user_organization
    .destroy({
      where: {
        role: req.role_organization,
        user_id: req.user.id,
        organization_id: req.organization.id
      }
    })
    .then(function (deleted) {
      if (deleted) {
        res.status(204).json('Assignment destroyed');
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

const models = require('../../models/models.js');

// Authzforce module
const config_service = require('../../lib/configService.js');
const config = config_service.get_config();
const config_authorization = config.authorization;
const config_usage_control = config.usage_control;
const authzforce_controller = require('./authzforces');
const ptp_controller = require('./ptps');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const debug = require('debug')('idm:web-role_controller');

// Autoload info if path include role_id
exports.load_role = function (req, res, next, role_id) {
  debug('--> load_role');

  // Add id of pep proxy in request
  req.role = { id: role_id };
  next();
};

// GET /idm/applications/:application_id/edit/roles -- Show roles and permissions
exports.manage_roles_view = function (req, res) {
  debug('--> manage_roles_view');

  res.render('applications/manage_roles', {
    application: req.application,
    authorization_level: config_authorization.level,
    data_usage_enabled: config_usage_control.enabled,
    csrf_token: req.csrfToken()
  });
};

// GET /idm/applications/:application_id/edit/roles/assignments -- Show roles and permissions
exports.manage_roles = function (req, res) {
  debug('--> manage_roles');

  const search_roles = models.role.findAll({
    where: {
      [Op.or]: [{ oauth_client_id: req.application.id }, { is_internal: true }]
    },
    attributes: ['id', 'name'],
    order: [['id', 'DESC']]
  });
  const search_permissions = models.permission.findAll({
    where: {
      [Op.or]: [{ oauth_client_id: req.application.id }, { is_internal: true }]
    },
    attributes: ['id', 'name'],
    order: [['id', 'ASC']]
  });
  const search_assignments = search_roles.then(function (roles) {
    return models.role_permission.findAll({
      where: { role_id: roles.map((elem) => elem.id) }
    });
  });

  Promise.all([search_roles, search_permissions, search_assignments])
    .then(function (values) {
      const roles = values[0];
      const permissions = values[1];
      const role_permission_assign = {};

      for (let i = 0; i < values[2].length; i++) {
        if (!role_permission_assign[values[2][i].role_id]) {
          role_permission_assign[values[2][i].role_id] = [];
        }
        role_permission_assign[values[2][i].role_id].push(values[2][i].permission_id);
      }
      res.send({
        application: {
          id: req.application.id,
          roles,
          permissions,
          role_permission_assign,
          role_policy_assign: {}
        }
      });
    })
    .catch(function (error) {
      debug('Error: ', error);
      // Send message of fail when creating role
      res.send({
        text: 'Error searching roles and permissions',
        type: 'danger'
      });
    });
};

// POST /idm/applications/:application_id/edit/roles/create -- Create new role
exports.create_role = function (req, res) {
  debug('--> create_role');

  // If body has parameters id or is_internal don't create the role
  if (req.body.id || req.body.is_internal) {
    res.send({ text: ' Failed creating role', type: 'danger' });
  } else {
    // Build a row and validate if input values are correct (not empty) before saving values in role table
    const role = models.role.build({
      name: req.body.name,
      oauth_client_id: req.application.id
    });

    role
      .validate()
      .then(function () {
        role
          .save({ fields: ['id', 'name', 'oauth_client_id'] })
          .then(function () {
            // Send message of success of creating role
            const message = { text: ' Create role', type: 'success' };
            res.send({ role: { id: role.id, name: role.name }, message });
          })
          .catch(function (error) {
            debug('Error: ', error);
            res.send({ text: ' Unable to create role', type: 'danger' });
          });
      })
      .catch(function (error) {
        debug('Error: ', error);
        // Send message of fail when creating role
        res.send({ text: error.errors[0].message, type: 'warning' });
      });
  }
};

// PUT /idm/applications/:application_id/edit/roles/:role_id/edit -- Edit a role
exports.edit_role = function (req, res) {
  debug('--> edit_role');

  const role_name = req.body.role_name;

  // If body has parameter is_internal or role_id is provider or purchaser don't edit the role
  if (['provider', 'purchaser'].includes(req.role.id) || req.body.is_internal) {
    res.send({ text: ' Failed editing role', type: 'danger' });
  } else {
    // Build a row and validate if input values are correct (not empty) before saving values in role table
    const role = models.role.build({
      name: role_name,
      oauth_client_id: req.application.id
    });

    role
      .validate()
      .then(function () {
        models.role
          .update(
            { name: role_name },
            {
              fields: ['name'],
              where: {
                id: req.role.id,
                oauth_client_id: req.application.id
              }
            }
          )
          .then(function () {
            // Send message of success of updating role
            res.send({
              text: ' Role was successfully edited.',
              type: 'success'
            });
          })
          .catch(function (error) {
            debug('Error: ', error);
            // Send message of fail when creating role
            res.send({ text: ' Failed editing role.', type: 'danger' });
          });
      })
      .catch(function (error) {
        debug('Error: ', error);
        // Send message of fail when creating role (empty inputs)
        res.send({ text: error.errors[0].message, type: 'warning' });
      });
  }
};

// DELETE /idm/applications/:application_id/edit/roles/:role_id/delete -- Delete a role
exports.delete_role = function (req, res) {
  debug('--> delete_role');

  // If role is provider or purchaser don't delete the role
  if (['provider', 'purchaser'].includes(req.role.id)) {
    res.send({ text: ' Failed deleting role', type: 'danger' });
  } else {
    // Destroy role
    models.role
      .destroy({
        where: {
          id: req.role.id,
          oauth_client_id: req.application.id
        }
      })
      .then(function (deleted) {
        if (deleted) {
          // Send message of success of deleting role
          res.send({
            text: ' Role was successfully deleted.',
            type: 'success'
          });
        } else {
          // Send message of fail when deleting role
          res.send({ text: ' Failed deleting role.', type: 'danger' });
        }
      })
      .catch(function (error) {
        debug('Error: ', error);
        // Send message of fail when deleting role
        res.send({ text: ' Failed deleting role.', type: 'danger' });
      });
  }
};

// POST /idm/applications/:application_id/edit/roles -- Assing permissions to roles
exports.role_permissions_assign = function (req, res) {
  debug('--> role_permission_assign');

  const roles_ac_id = Object.keys(JSON.parse(req.body.submit_access_control_assignment));
  const roles_uc_id = Object.keys(JSON.parse(req.body.submit_usage_control_assignment));

  // Filter req.body and obtain an array without roles provider and purchaser
  const public_roles_ac_id = roles_ac_id.filter((elem) => !['provider', 'purchaser'].includes(elem));

  // Filter req.body and obtain an array without roles provider and purchaser
  const public_roles_uc_id = roles_uc_id.filter((elem) => !['provider', 'purchaser'].includes(elem));

  // If the array has elements destroy rows indicated on the array and create new ones
  if (public_roles_ac_id.length > 0 || public_roles_uc_id.length > 0) {
    const promise_change_ac =
      public_roles_ac_id.length > 0
        ? update_access_control_assignment(
            req.application.id,
            public_roles_ac_id,
            req.body.submit_access_control_assignment
          )
        : Promise.resolve();
    const promise_change_uc =
      config_usage_control.enabled && public_roles_uc_id.length > 0
        ? update_usage_control_assignment(
            req.application.id,
            public_roles_uc_id,
            req.body.submit_usage_control_assignment
          )
        : Promise.resolve();

    return Promise.all([promise_change_ac, promise_change_uc])
      .then(function () {
        // Send message of success of assign permissions to roles
        req.session.message = {
          text: ' Modified roles, permissions and policies assignments.',
          type: 'success'
        };
        return res.redirect('/idm/applications/' + req.application.id);
      })
      .catch(function (error) {
        debug('Error', error);
        req.session.message = error;
        return res.redirect('/idm/applications/' + req.application.id);
      });
  }
  // Redirect to show application if there is no changes
  return res.redirect('/idm/applications/' + req.application.id);
};

function update_access_control_assignment(application_id, public_roles_ac_id, submit_access_control_assignment) {
  debug('--> update_access_control_assignment');

  return new Promise(function (resolve, reject) {
    const assignement = JSON.parse(submit_access_control_assignment);
    // Array of objects with role_id, permission_id and oauth_client_id
    const create_assign_roles_permissions = [];

    for (const role in assignement) {
      if (!['provider', 'purchaser'].includes(role)) {
        for (let permission = 0; permission < assignement[role].length; permission++) {
          create_assign_roles_permissions.push({
            role_id: role,
            permission_id: assignement[role][permission],
            oauth_client_id: application_id
          });
        }
      }
    }

    return models.role_permission
      .destroy({
        where: {
          role_id: public_roles_ac_id
        }
      })
      .then(function () {
        // Inset values into role_permission table
        return models.role_permission.bulkCreate(create_assign_roles_permissions);
      })
      .then(function () {
        return authzforce_controller.submit_authzforce_policies(application_id, assignement);
      })
      .then(function (message) {
        // Send message of success of assign permissions to roles
        message = message
          ? message
          : {
              text: ' Modified roles and permissions.',
              type: 'success'
            };
        return resolve(message);
      })
      .catch(function (error) {
        debug('Error ' + error);
        // Send message of fail in assign permissions to roles
        error = error
          ? error
          : {
              text: ' Roles and permissions assignment error.',
              type: 'warning'
            };
        return reject(error);
      });
  });
}

function update_usage_control_assignment(application_id, public_roles_uc_id, submit_usage_control_assignment) {
  debug('--> update_usage_control_assignment');

  return new Promise(function (resolve, reject) {
    const assignement = JSON.parse(submit_usage_control_assignment);
    // Array of objects with role_id, permission_id and oauth_client_id
    const create_assign_roles_usage_policies = [];

    for (const role in assignement) {
      if (!['provider', 'purchaser'].includes(role)) {
        for (let usage_policy = 0; usage_policy < assignement[role].length; usage_policy++) {
          create_assign_roles_usage_policies.push({
            role_id: role,
            usage_policy_id: assignement[role][usage_policy]
          });
        }
      }
    }

    models.role_usage_policy
      .destroy({
        where: {
          role_id: public_roles_uc_id
        }
      })
      .then(function () {
        // Inset values into role_usage_policy table
        return models.role_usage_policy.bulkCreate(create_assign_roles_usage_policies);
      })
      .then(function () {
        // TODO: SEND REQUEST TO PDP
        return ptp_controller.submit_ptp_usage_policies(application_id, assignement);
      })
      .then(function (message) {
        // Send message of success of assign usage_policys to roles
        message = message
          ? message
          : {
              text: ' Modified usage_policies.',
              type: 'success'
            };
        resolve(message);
      })
      .catch(function (error) {
        debug('Error ' + error);
        // Send message of fail in assign usage_policys to roles
        error = error
          ? error
          : {
              text: ' Roles and usage_policies assignment error.',
              type: 'warning'
            };
        reject(error);
      });
  });
}

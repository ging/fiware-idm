const models = require('../../models/models.js');
const config_service = require('../../lib/configService.js');
const config_authzforce = config_service.get_config().authorization;

const debug = require('debug')('idm:web-permission_controller');

// Autoload info if path include permission_id
exports.load_permission = function (req, res, next, permission_id) {
  debug('--> load_permission');

  // Add id of pep proxy in request
  req.permission = { id: permission_id };
  next();
};

// POST /idm/applications/:application_id/edit/permissions/create -- Create new permission
exports.create_permission = function (req, res) {
  debug('--> create_permission');

  // If body has parameters id or is_internal don't create the permission
  if (req.body.id || req.body.is_internal) {
    res.send({ text: ' Failed creating permission', type: 'danger' });
  } else {
    // Build a row and validate if input values are correct (not empty) before saving values in permission table
    const permission = models.permission.build({
      name: req.body.name,
      description: req.body.description,
      action: req.body.action,
      resource: req.body.resource,
      authorization_service_header: req.body.authorization_service_header,
      use_authorization_service_header: req.body.use_authorization_service_header,
      is_regex: req.body.is_regex,
      xml: config_authzforce.level === 'advanced' ? req.body.xml : undefined,
      oauth_client_id: req.application.id
    });

    // Array of errors to be send
    const errors_inputs = [];

    if (config_authzforce.level === 'advanced') {
      // See if fields action, resource and xml are in the same request
      if ((req.body.action || req.body.resource) && req.body.xml) {
        errors_inputs.push({
          message: 'xml_with_action_and_resource_not_allow'
        });
      }
    }

    // See if action and resource are defined when xml is not
    if (!(req.body.action && req.body.resource) && !req.body.xml) {
      errors_inputs.push({ message: 'define_rule' });
    }

    // Validate if name and description aren't empty
    permission
      .validate()
      .then(function () {
        // Send a message with errors
        if (errors_inputs.length > 0) {
          res.send({ text: errors_inputs, type: 'warning' });
        } else {
          // Save values in permission table
          permission
            .save({
              fields: [
                'id',
                'name',
                'description',
                'action',
                'resource',
                'authorization_service_header',
                'use_authorization_service_header',
                'is_regex',
                'xml',
                'oauth_client_id'
              ]
            })
            .then(function () {
              // Send message of success of creating permission
              const message = { text: ' Create permission', type: 'success' };
              res.send({
                permission: { id: permission.id, name: permission.name },
                message
              });
            })
            .catch(function (error) {
              debug('Error: ', error);
              res.send({
                text: ' Unable to create permission',
                type: 'danger'
              });
            });
        }
      })
      .catch(function (error) {
        // Send message of fail when creating permission
        res.send({ text: errors_inputs.concat(error.errors), type: 'warning' });
      });
  }
};

// GET /idm/applications/:application_id/edit/permissions/:permission_id -- Get a permission
exports.get_permission = function (req, res) {
  debug('--> get_permission');

  // See if the request is via AJAX or browser
  if (['1', '2', '3', '4', '5', '6'].includes(req.permission.id)) {
    res.send({ text: ' Fail.', type: 'danger' });
  } else if (req.xhr) {
    // Search info about the users authorized in the application
    models.permission
      .findById(req.permission.id)
      .then(function (permission) {
        if (permission) {
          res.send(permission);
        } else {
          res.send({ text: ' Permission does not exist.', type: 'danger' });
        }
      })
      .catch(function (error) {
        res.send(error);
      });
  } else {
    // Redirect to show application if the request is via browser
    res.redirect('/idm/applications/' + req.application.id);
  }
};

// PUT /idm/applications/:application_id/edit/permissions/:permission_id/edit -- Edit a permission
exports.edit_permission = function (req, res) {
  debug('--> edit_permission');

  // If body has parameters id or is_internal don't create the permission
  if (['1', '2', '3', '4', '5', '6'].includes(req.permission.id) || req.body.is_internal) {
    res.send({ text: ' Failed updating permission', type: 'danger' });
  } else {
    const permission = models.permission.build({
      name: req.body.name,
      description: req.body.description,
      resource: req.body.resource,
      authorization_service_header: req.body.authorization_service_header,
      use_authorization_service_header: req.body.use_authorization_service_header,
      is_regex: req.body.is_regex,
      action: req.body.action,
      xml: config_authzforce.level === 'advanced' ? req.body.xml : undefined,
      oauth_client_id: req.application.id
    });

    // Array of errors to be send
    const errors_inputs = [];

    if (config_authzforce.level === 'advanced') {
      // See if fields action, resource and xml are in the same request
      if ((req.body.action || req.body.resource) && req.body.xml) {
        errors_inputs.push({
          message: 'xml_with_action_and_resource_not_allow'
        });
      }
    }

    // See if action and resource are defined when xml is not
    if (!(req.body.action && req.body.resource) && !req.body.xml) {
      errors_inputs.push({ message: 'define_rule' });
    }

    permission
      .validate()
      .then(function () {
        // Send a message with errors
        if (errors_inputs.length > 0) {
          res.send({ text: errors_inputs, type: 'warning' });
        } else {
          models.permission
            .update(
              {
                name: req.body.name,
                description: req.body.description,
                resource: req.body.resource,
                authorization_service_header: req.body.authorization_service_header,
                use_authorization_service_header: req.body.use_authorization_service_header,
                is_regex: req.body.is_regex,
                action: req.body.action,
                xml: config_authzforce.level === 'advanced' ? req.body.xml : undefined
              },
              {
                fields: [
                  'name',
                  'description',
                  'action',
                  'resource',
                  'authorization_service_header',
                  'use_authorization_service_header',
                  'is_regex',
                  'xml'
                ],
                where: {
                  id: req.permission.id,
                  oauth_client_id: req.application.id
                }
              }
            )
            .then(function () {
              // Send message of success of updating permission
              res.send({
                message: {
                  text: ' Permission was successfully edited.',
                  type: 'success'
                }
              });
            })
            .catch(function (error) {
              debug('Error: ', error);
              // Send message of fail when creating role
              res.send({ text: ' Failed editing permission.', type: 'danger' });
            });
        }
      })
      .catch(function (error) {
        // Send message of fail when creating role (empty inputs)
        res.send({ text: errors_inputs.concat(error.errors), type: 'warning' });
      });
  }
};

// DELETE /idm/applications/:application_id/edit/permissions/:permission_id/delete -- Delete a permission
exports.delete_permission = function (req, res) {
  debug('--> delete_permission');

  // If permission is internal don't delete the role
  if (['1', '2', '3', '4', '5', '6'].includes(req.permission.id)) {
    res.send({ text: ' Failed deleting permission', type: 'danger' });
  } else {
    // Destroy role
    models.permission
      .destroy({
        where: {
          id: req.permission.id,
          oauth_client_id: req.application.id
        }
      })
      .then(function (deleted) {
        if (deleted) {
          // Send message of success of deleting role
          res.send({
            text: ' Permission was successfully deleted.',
            type: 'success'
          });
        } else {
          // Send message of fail when deleting role
          res.send({ text: ' Failed deleting permission.', type: 'danger' });
        }
      })
      .catch(function (error) {
        debug('Error: ', error);
        // Send message of fail when deleting role
        res.send({ text: ' Failed deleting permission.', type: 'danger' });
      });
  }
};

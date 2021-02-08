const models = require('../../models/models.js');
const _ = require('lodash');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const debug = require('debug')('idm:api-check_permissions_controller');

const application_policy = require('../../etc/policies/api/applications.json');

exports.check_request = function (req, res, next) {
  debug('--> check_request');

  return new Promise(function (resolve, reject) {
    if (!req.application) {
      obtain_defined_policies(req.originalUrl, req.method, req.params)
        .then(function (needed_permissions) {
          req.needed_permissions = needed_permissions;
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
    } else {
      owned_permissions(req.token_owner.id, req.application.id)
        .then(function (user_policies) {
          req.user_owned_permissions = user_policies.user_owned_permissions;
          req.user_owned_roles = user_policies.user_owned_roles;
          return obtain_defined_policies(req.originalUrl, req.method, req.params);
        })
        .then(function (needed_permissions) {
          req.needed_permissions = needed_permissions;
          if (check_permissions(req.user_owned_permissions, needed_permissions)) {
            resolve(true);
          } else {
            reject({
              error: {
                message: 'User not allow to perform the action',
                code: 403,
                title: 'Forbidden'
              }
            });
          }
        })
        .catch(function (error) {
          reject(error);
        });
    }
  });
};

// Middleware to see user permissions in the application
function owned_permissions(token_owner_id, application_id) {
  debug('--> owned_permissions');

  const user_policies = { user_owned_permissions: [], user_owned_roles: [] };

  // Search organizations in wich user is member or owner
  const search_organizations = models.user_organization.findAll({
    where: { user_id: token_owner_id },
    include: [
      {
        model: models.organization,
        attributes: ['id', 'name', 'description']
      }
    ]
  });
  // Search roles for user or the organization to which the user belongs
  const search_roles = search_organizations.then(function (organizations) {
    const search_role_organizations = [];
    if (organizations.length > 0) {
      for (let i = 0; i < organizations.length; i++) {
        search_role_organizations.push({
          organization_id: organizations[i].organization_id,
          role_organization: organizations[i].role
        });
      }
    }
    return models.role_assignment.findAll({
      where: {
        [Op.or]: [{ [Op.or]: search_role_organizations }, { user_id: token_owner_id }],
        oauth_client_id: application_id
      }
    });
  });
  // Search permissions
  const search_permissions = search_roles.then(function (roles) {
    if (roles.length > 0) {
      const roles_id = roles.map((elem) => elem.role_id);

      user_policies.user_owned_roles = roles_id;

      return models.role_permission.findAll({
        where: { role_id: roles_id },
        attributes: ['permission_id']
      });
    }

    return [];
  });

  return Promise.all([search_organizations, search_roles, search_permissions]).then(function (values) {
    let user_permissions_id = [];

    if (values[2] && values[2].length > 0) {
      // Pre load permissions of user in request
      user_permissions_id = values[2].map((elem) => elem.permission_id);
      user_policies.user_owned_permissions = user_permissions_id;
    }
    return Promise.resolve(user_policies);
  });
}

function check_permissions(user_permission, needed_permissions) {
  if (needed_permissions.length > 0) {
    return needed_permissions.some((r) => user_permission.includes(r));
  }
  return true;
}

// Obtain all policies from application_policy.json
function obtain_defined_policies(url, method, parameters) {
  return new Promise(function (resolve) {
    // Remove trailing slash if exists
    url = url.replace(/\/$/, '');
    const last_url_segment = url.split('/').pop();

    let key = url;

    // Obtain function to execute from http method
    let method_function = application_policy.method_function[method];

    // If HTTP method is GET, check if last segment of url refers to an instance
    // of an object or to a list of objects
    if (method === 'GET') {
      if (parameters[_.findLastKey(parameters)] === last_url_segment) {
        method_function = application_policy.method_function[method].singular;
      } else {
        method_function = application_policy.method_function[method].list;
      }
    }
    // Replace all request parameter with empty values
    if (!_.isEmpty(parameters)) {
      for (const i in parameters) {
        key = key.replace('/' + parameters[i], '');
      }
    }
    // Delete "v1" from key and add method and substitute slash with colon
    key = key.replace(/\//g, ':').substring(4) + ':' + method_function;

    // Obtain permission defined from policy
    const needed_permissions = application_policy.actions[key] ? application_policy.actions[key].split(',') : [];

    resolve(needed_permissions);
  });
}

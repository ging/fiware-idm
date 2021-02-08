const models = require('../../models/models.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const debug = require('debug')('idm:web-check_permissions_controller');

// Middleware to see user permissions in the application
exports.owned_permissions = function (req, res, next) {
  debug('--> owned_permissions');

  req.user_owned_permissions = [];
  req.user_owned_roles = [];
  req.user_organizations = [];

  // Search organizations in wich user is member or owner
  const search_organizations = models.user_organization.findAll({
    where: { user_id: req.session.user.id },
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
      req.user_organizations = organizations;
      for (let i = 0; i < organizations.length; i++) {
        search_role_organizations.push({
          organization_id: organizations[i].organization_id,
          role_organization: organizations[i].role
        });
      }
    }
    return models.role_assignment.findAll({
      where: {
        [Op.or]: [{ [Op.or]: search_role_organizations }, { user_id: req.session.user.id }],
        oauth_client_id: req.application.id
      }
    });
  });
  // Search permissions
  const search_permissions = search_roles.then(function (roles) {
    if (roles.length > 0) {
      const roles_id = roles.map((elem) => elem.role_id);

      req.user_owned_roles = roles_id;

      return models.role_permission.findAll({
        where: { role_id: roles_id },
        attributes: ['permission_id']
      });
    }

    return [];
  });

  Promise.all([search_organizations, search_roles, search_permissions])
    .then(function (values) {
      let user_permissions_id = [];

      if (values[2] && values[2].length > 0) {
        // Pre load permissions of user in request
        user_permissions_id = values[2].map((elem) => elem.permission_id);
        req.user_owned_permissions = user_permissions_id;
      }

      // Check if the user can access to a specific route according to his permissions
      if (check_user_action(req.application, req.path, req.method, user_permissions_id)) {
        next();
      } else {
        Promise.reject('not_allow');
      }
    })
    .catch(function (error) {
      debug('Error: ' + error);
      // Send an error if the the request is via AJAX or redirect if is via browser
      const response = { text: ' User is not authorized.', type: 'danger' };

      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications');
    });
};

// Method to see users permissions to do some actions
// - 1 Get and assign all internal application roles
// - 2 Manage the application
// - 3 Manage roles
// - 4 Manage authorizations
// - 5 Get and assign all public application roles
// - 6 Get and assign only public owned roles
function check_user_action(application, path, method, permissions) {
  switch (true) {
    case path.includes('step/avatar') || path.includes('step/eidas'):
      if (permissions.includes('2')) {
        return true;
      }
      break;
    case path.includes('step/roles') ||
      path.includes('edit/roles') ||
      path.includes('edit/permissions') ||
      path.includes('edit/usage_policies') ||
      path.includes('edit/eidas'):
      if (permissions.includes('3')) {
        return true;
      }
      break;
    case path.includes('edit/users') ||
      path.includes('edit/organizations') ||
      path.includes('edit/trusted_applications'):
      if (permissions.some((r) => ['1', '5', '6'].includes(r))) {
        return true;
      }
      break;
    case path.includes('edit') || path.includes('iot') || path.includes('pep') || path.includes('token_types'):
      if (permissions.includes('2')) {
        return true;
      }
      break;
    case path.includes(application.id) && method === 'DELETE':
      if (permissions.includes('2')) {
        return true;
      }
      break;
    case path.includes(application.id) && method === 'GET':
      return true;
    default:
      return false;
  }
  return false;
}

// Funtion to see if request is via AJAX or Browser and depending on this, send a request
function send_response(req, res, response, url) {
  if (req.xhr) {
    res.send(response);
  } else {
    if (response.message) {
      req.session.message = response.message;
    } else {
      req.session.message = response;
    }
    res.redirect(url);
  }
}

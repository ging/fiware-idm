const models = require('../../models/models.js');
const gravatar = require('gravatar');
const array_contains_array = require('../../lib/object_functions.js').array_contains_array;

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const debug = require('debug')('idm:web-authorize_user_app_controller');

// GET /idm/applications/:application_id/edit/users -- Search users authorized
exports.get_users = function (req, res, next) {
  debug('--> get_users');

  // See if the request is via AJAX or browser
  if (req.xhr) {
    // Search info about the users authorized in the application
    models.role_assignment
      .findAll({
        where: {
          oauth_client_id: req.application.id,
          user_id: { [Op.ne]: null },
          organization_id: { [Op.eq]: null }
        },
        include: [
          {
            model: models.user,
            attributes: ['id', 'username', 'email', 'image', 'gravatar']
          }
        ]
      })
      .then(function (users_application) {
        // Array of users authorized in the application
        const users_authorized = [];

        users_application.forEach(function (app) {
          let image = '/img/logos/medium/user.png';
          if (app.User.gravatar) {
            image = gravatar.url(app.User.email, { s: 36, r: 'g', d: 'mm' }, { protocol: 'https' });
          } else if (app.User.image !== 'default') {
            image = '/img/users/' + app.User.image;
          }
          users_authorized.push({
            user_id: app.User.id,
            role_id: app.role_id,
            username: app.User.username,
            image
          }); // Added parameter is to control which elements will be deleted or added
          // to the table when authorizing other users
        });

        // Array to indicate which roles are going to be search
        const where_search_role = [];

        // If permission is assign only public owned roles
        if (req.user_owned_permissions.includes('6')) {
          where_search_role.push({
            id: req.user_owned_roles.filter((elem) => !(elem === 'provider' || elem === 'purchaser'))
          });
        }

        // If permission is assign all public owned roles
        if (req.user_owned_permissions.includes('5')) {
          where_search_role.push({ oauth_client_id: req.application.id });
        }

        // If permission is assign only internal roles
        if (req.user_owned_permissions.includes('1')) {
          where_search_role.push({ is_internal: true });
        }

        // Search roles to display when authorize users
        models.role
          .findAll({
            where: { [Op.or]: where_search_role },
            attributes: ['id', 'name'],
            order: [['id', 'DESC']]
          })
          .then(function (roles) {
            // Filter users_authorized depends on the permissions of the user logged
            for (let i = 0; i < users_authorized.length; i++) {
              if (roles.some((role) => role.id === users_authorized[i].role_id) === false) {
                users_authorized[i].role_id = '';
              }
            }

            // Sen info about roles, users authorized and application
            res.send({
              users_authorized,
              roles,
              errors: []
            });
          })
          .catch(function (error) {
            next(error);
          });
      })
      .catch(function (error) {
        next(error);
      });
  } else {
    // Redirect to show application if the request is via browser
    res.redirect('/idm/applications/' + req.application.id);
  }
};

// GET /idm/applications/:application_id/users/available -- Search users to authorize in an application
exports.available_users = function (req, res) {
  debug('--> available_users');

  // Obtain key to search in the organization table
  const key = req.query.key;

  if (key.length > 1 && key.includes('%') === false && key.includes('_') === false) {
    // Search if username is like the input key
    models.user
      .findAll({
        attributes: ['username', 'id', 'image'],
        where: {
          username: {
            like: '%' + key + '%'
          }
        }
      })
      .then(function (users) {
        // If found, send ana array of users with the name and the id of each one
        if (users.length > 0) {
          users.forEach(function (elem) {
            if (elem.image !== 'default') {
              elem.image = '/img/users/' + elem.image;
            } else {
              elem.image = '/img/logos/medium/user.png';
            }
          });
          res.send({ users });
        } else {
          // If the result is null send an error message
          res.send({ users: [] });
        }
      });
  } else {
    res.send({ users: [] });
  }
};

// POST /idm/applications/:application_id/edit/users -- Authorize users in an application
exports.authorize_users = function (req, res) {
  debug('--> authorize_users');

  const users_to_be_authorized = JSON.parse(req.body.submit_authorize);

  if (users_to_be_authorized.length > 0) {
    // Array to indicate which roles are going to be search
    const where_search_role = [];

    // If permissionis assign only public owned roles
    if (req.user_owned_permissions.includes('6')) {
      where_search_role.push({
        id: req.user_owned_roles.filter((elem) => !(elem === 'provider' || elem === 'purchaser'))
      });
    }

    // If permission is assign all public roles
    if (req.user_owned_permissions.includes('5')) {
      where_search_role.push({ oauth_client_id: req.application.id });
    }

    // If permission is assign only internal roles
    if (req.user_owned_permissions.includes('1')) {
      where_search_role.push({ is_internal: true });
    }

    const search_changeable_roles_by_user = models.role.findAll({
      where: { [Op.or]: where_search_role },
      attributes: ['id']
    });

    search_changeable_roles_by_user.then(function (changeable_roles_by_user) {
      // Array of ids that user can change
      const ids_changeable_roles_by_user = changeable_roles_by_user.map((elem) => elem.id);

      // Array of new rows in role_assignment
      const new_assignment = [];

      // Array of roles ids of submit request
      const ids_roles_to_be_changed = [];
      for (let i = 0; i < users_to_be_authorized.length; i++) {
        if (users_to_be_authorized[i].role_id !== '') {
          ids_roles_to_be_changed.push(users_to_be_authorized[i].role_id);
          new_assignment.push({
            user_id: users_to_be_authorized[i].user_id,
            role_id: users_to_be_authorized[i].role_id,
            oauth_client_id: req.application.id
          });
        }
      }

      if (array_contains_array(ids_changeable_roles_by_user, ids_roles_to_be_changed)) {
        debug('You can change new roles');

        // Delete rows from role_assignment
        const delete_rows = models.role_assignment.destroy({
          where: {
            oauth_client_id: req.application.id,
            role_id: ids_changeable_roles_by_user,
            user_id: { [Op.ne]: null },
            organization_id: { [Op.eq]: null }
          }
        });

        // Handle promise of delete and create rows
        delete_rows
          .then(function () {
            // Create rows in role_assignment
            return models.role_assignment
              .bulkCreate(new_assignment)
              .then(function () {
                // Send message of success in updating authorizations
                req.session.message = {
                  text: ' Modified users authorization.',
                  type: 'success'
                };
                res.redirect('/idm/applications/' + req.application.id);
              })
              .catch(function (error) {
                debug('Error: ', error);
                return Promise.reject();
              });
          })
          .catch(function (error) {
            debug('Error: ', error);
            // Send message of fail when updating authorizations
            req.session.message = {
              text: ' Modified users authorization error.',
              type: 'danger'
            };
            res.redirect('/idm/applications/' + req.application.id);
          });
      } else {
        debug("User don't have permissions to change roles");
        // Send message of fail when updating authorizations
        req.session.message = { text: ' Not allow.', type: 'danger' };
        res.redirect('/idm/applications/' + req.application.id);
      }
    });
  } else {
    debug('There is no submit object');
    // Send message of fail when updating authorizations
    req.session.message = { text: ' Not allow.', type: 'danger' };
    res.redirect('/idm/applications/' + req.application.id);
  }
};

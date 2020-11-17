const models = require('../../models/models.js');
const debug = require('debug')('idm:web-manage_members_controller');
const gravatar = require('gravatar');

// GET /idm/organizations/:organization_id/edit/users -- Send all members of organization
exports.get_members = function (req, res, next) {
  debug('--> get_members');

  // See if the request is via AJAX or browser
  if (req.xhr) {
    // Search info about the users authorized in the application
    models.user_organization
      .findAll({
        where: { organization_id: req.organization.id },
        include: [
          {
            model: models.user,
            attributes: ['id', 'username', 'email', 'image', 'gravatar']
          }
        ]
      })
      .then(function (user_organization) {
        // Array of users authorized in the application
        const members = [];

        user_organization.forEach(function (user) {
          let image = '/img/logos/medium/user.png';
          if (user.User.gravatar) {
            image = gravatar.url(user.User.email, { s: 36, r: 'g', d: 'mm' }, { protocol: 'https' });
          } else if (user.User.image !== 'default') {
            image = '/img/users/' + user.User.image;
          }
          members.push({
            user_id: user.User.id,
            role: user.role,
            username: user.User.username,
            image
          });
        });

        res.send({ members });
      })
      .catch(function (error) {
        next(error);
      });
  } else {
    // Redirect to show application if the request is via browser
    res.redirect('/idm/organizations/' + req.organization.id);
  }
};

// POST /idm/organizations/:organization_id/edit/users -- Add members to the organization
exports.add_members = function (req, res) {
  debug('--> add_members');

  const possible_members = JSON.parse(req.body.submit_authorize);

  const new_assign = [];

  for (let i = 0; i < possible_members.length; i++) {
    possible_members[i].organization_id = req.organization.id;
    new_assign.push(possible_members[i].user_id);
  }

  const is_duplicate = new_assign.some(function (item, idx) {
    return new_assign.indexOf(item) !== idx;
  });

  if (is_duplicate) {
    debug('Duplicate user in post request ');
    req.session.message = { text: ' Modified members error.', type: 'danger' };
    res.redirect('/idm/organizations/' + req.organization.id);
  } else {
    models.user_organization
      .destroy({
        where: { organization_id: req.organization.id }
      })
      .then(function (deleted) {
        if (deleted) {
          models.user_organization
            .bulkCreate(possible_members)
            .then(function () {
              // Send message of success in updating authorizations
              req.session.message = {
                text: ' Modified members.',
                type: 'success'
              };
              res.redirect('/idm/organizations/' + req.organization.id);
            })
            .catch(function (error) {
              // Send message of fail when updating authorizations
              debug('Error when create new user organization relation ' + error);
              req.session.message = {
                text: ' Modified members error.',
                type: 'danger'
              };
              res.redirect('/idm/organizations/' + req.organization.id);
            });
        } else {
          req.session.message = {
            text: ' Modified members error.',
            type: 'danger'
          };
          res.redirect('/idm/organizations/' + req.organization.id);
        }
      })
      .catch(function (error) {
        debug('Error deleting user organization relation ' + error);
        req.session.message = {
          text: ' Modified members error.',
          type: 'danger'
        };
        res.redirect('/idm/organizations/' + req.organization.id);
      });
  }
};

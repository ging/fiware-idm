const models = require('../../models/models.js');
const debug = require('debug')('idm:web-admin_controller');
const gravatar = require('gravatar');

// See if user is administrator
exports.is_admin = function (req, res, next) {
  debug('--> is_admin');

  // If users session has not the admin field redirect to initial page
  if (req.session.user.admin) {
    next();
  } else {
    res.redirect('/');
  }
};

// GET /idm/admins/users -- Send admin users
exports.admin_users = function (req, res) {
  debug(' --> admin_users');

  const key = req.query.key ? req.query.key : '';
  const offset = req.query.page ? (req.query.page - 1) * 5 : 0;
  const limit = req.query.limit === 'all' ? null : 5;

  models.user
    .findAndCountAll({
      where: {
        admin: true,
        username: {
          like: '%' + key + '%'
        }
      },
      attributes: ['id', 'email', 'username', 'image', 'gravatar'],
      offset,
      limit
    })
    .then(function (result) {
      const users = result.rows;
      const count = result.count;

      if (users.length > 0) {
        users.forEach(function (user) {
          if (user.gravatar) {
            user.image = gravatar.url(user.email, { s: 100, r: 'g', d: 'mm' }, { protocol: 'https' });
          } else if (user.image === 'default') {
            user.image = '/img/logos/medium/user.png';
          } else {
            user.image = '/img/users/' + user.image;
          }
        });
      }
      res.send({ admin_users: users, admin_users_number: count });
    })
    .catch(function (error) {
      debug('Error get admin users: ' + error);
      const message = { text: ' Unable to find admins', type: 'danger' };
      send_response(req, res, message, '/idm/admins/administrators');
    });
};

// GET /idm/admins/administrators --  Render administrators view
exports.index_administrators = function (req, res) {
  debug('--> index_administrators');

  // Set message to send when rendering view and delete from request
  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }

  res.render('admin/administrators', { csrf_token: req.csrfToken() });
};

// PUT /idm/admins/administrators --  Give admin role to specified users
exports.update_administrators = function (req, res) {
  debug('--> update_administrators');

  models.user
    .findAll({
      where: { admin: true },
      attributes: ['id']
    })
    .then(function (users) {
      const actual_admins = users.map((elem) => elem.id);

      const new_admins = JSON.parse(req.body.submit_authorize);
      const users_not_admin = [];

      actual_admins.forEach(function (elem) {
        if (new_admins.includes(elem)) {
          new_admins.splice(new_admins.indexOf(elem), 1);
        } else {
          users_not_admin.push(elem);
        }
      });

      models.user
        .update(
          {
            admin: true
          },
          {
            where: { id: new_admins },
            fields: ['admin']
          }
        )
        .then(function () {
          models.user
            .update(
              {
                admin: false
              },
              {
                where: { id: users_not_admin },
                fields: ['admin']
              }
            )
            .then(function () {
              req.session.message = {
                text: ' Success authorize admins.',
                type: 'success'
              };
              res.redirect('/idm/admins/administrators');
            })
            .catch(function (error) {
              debug('  -> error' + error);
              req.session.message = {
                text: ' Fail authorize admins.',
                type: 'danger'
              };
              res.redirect('/idm/admins/administrators');
            });
        })
        .catch(function (error) {
          debug('  -> error' + error);
          req.session.message = {
            text: ' Fail authorize admins.',
            type: 'danger'
          };
          res.redirect('/idm/admins/administrators');
        });
    })
    .catch(function (error) {
      debug('  -> error' + error);
      res.redirect('/idm/admins/administrators');
    });
};

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

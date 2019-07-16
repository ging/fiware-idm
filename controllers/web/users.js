const models = require('../../models/models.js');
const config = require('../../config');
const fs = require('fs');
const path = require('path');
const gravatar = require('gravatar');
const https = require('https');
const external_auth = config.external_auth;

const email_list = config.email_list_type
  ? fs
      .readFileSync(
        path.join(
          __dirname,
          '../../etc/email_list/' + config.email_list_type + '.txt'
        )
      )
      .toString('utf-8')
      .split('\n')
  : [];

const debug = require('debug')('idm:web-user_controller');

const email = require('../../lib/email.js');
const image = require('../../lib/image.js');

// MW to see if user can do some actions
exports.owned_permissions = function(req, res, next) {
  debug('--> owned_permissions');

  if (req.session.user.id === req.user.id) {
    next();
  } else {
    const message = { text: ' Not allowed', type: 'danger' };
    send_response(req, res, message, '/');
  }
};

// MW to load info about a user
exports.load_user = function(req, res, next, user_id) {
  debug('--> load_user');

  if (req.path === '/idm/users/available') {
    next();
  } else {
    // Search user whose id is user_id
    models.user
      .findOne({
        where: { id: user_id },
        attributes: [
          'id',
          'username',
          'email',
          'description',
          'website',
          'image',
          'gravatar',
        ],
      })
      .then(function(user) {
        // If user exists, set image from file system
        if (user) {
          req.user = user;
          // Send request to next function
          next();
        } else {
          req.session.message = {
            text: ' User doesn`t exist.',
            type: 'danger',
          };
          res.redirect('/');
        }
      })
      .catch(function(error) {
        next(error);
      });
  }
};

// GET /idm/users/:user_id -- Show info about a user
exports.show = function(req, res, next) {
  debug('--> show');

  // Find user applications
  models.role_assignment
    .findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: models.oauth_client,
          attributes: ['id', 'name', 'url', 'image'],
        },
      ],
    })
    .then(function(user_applications) {
      // See if user to show is equal to user logged
      if (req.session.user.id === req.user.id) {
        req.user.auth = true;
      }
      if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message;
      }

      if (req.user.gravatar) {
        req.user.image = gravatar.url(
          req.user.email,
          { s: 100, r: 'g', d: 'mm' },
          { protocol: 'https' }
        );
      } else if (req.user.image === 'default') {
        req.user.image = '/img/logos/original/user.png';
      } else {
        req.user.image = '/img/users/' + req.user.image;
      }

      const applications = [];

      // If user has applications, set image from file system and obtain info from each application
      if (user_applications.length > 0) {
        user_applications.forEach(function(app) {
          if (
            applications.length === 0 ||
            !applications.some(elem => elem.id === app.OauthClient.id)
          ) {
            if (app.OauthClient.image === 'default') {
              app.OauthClient.image = '/img/logos/medium/app.png';
            } else {
              app.OauthClient.image =
                '/img/applications/' + app.OauthClient.image;
            }
            applications.push(app.OauthClient);
          }
        });

        // Order applications and render view
        applications.sort(function(a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
      }

      res.render('users/show', {
        user: req.user,
        applications,
        csrf_token: req.csrfToken(),
      });
    })
    .catch(function(error) {
      next(error);
    });
};

// GET /idm/users/:user_id/get_applications -- Send applications in where user is authorized
exports.get_applications = function(req, res) {
  debug('--> get_applications');

  const key = req.query.key ? '%' + req.query.key + '%' : '%%';
  const offset = req.query.page ? (req.query.page - 1) * 5 : 0;

  models.helpers
    .search_distinct(
      'role_assignment',
      'oauth_client',
      req.user.id,
      'user',
      key,
      offset,
      true
    )
    .then(function(applications_authorized) {
      const applications = [];

      let count = 0;

      // If user has applciations, set image from file system and obtain info from each user
      if (applications_authorized.length > 0) {
        count = applications_authorized[0].count;

        applications_authorized.forEach(function(app) {
          if (app.image === 'default') {
            app.image = '/img/logos/medium/app.png';
          } else {
            app.image = '/img/applications/' + app.image;
          }
          applications.push({
            id: app.oauth_client_id,
            name: app.name,
            image: app.image,
            url: app.url,
          });
        });
      }
      res.send({ applications, applications_number: count });
    })
    .catch(function(error) {
      debug('Error get appliications authorized: ' + error);
      const message = { text: ' Unable to find applications', type: 'danger' };
      send_response(req, res, message, '/idm');
    });
};

// GET /idm/organizations/:organization_id/get_organizations -- Send organizations to which user belongs
exports.get_organizations = function(req, res) {
  debug('--> get_organizations');

  const key = req.query.key ? '%' + req.query.key + '%' : '%%';
  const offset = req.query.page ? (req.query.page - 1) * 5 : 0;

  models.helpers
    .search_distinct(
      'user_organization',
      'organization',
      req.session.user.id,
      'user',
      key,
      offset,
      true
    )
    .then(function(organizations_authorized) {
      const organizations = [];

      let count = 0;

      // If user has organizations, set image from file system and obtain info from each organization
      if (organizations_authorized.length > 0) {
        count = organizations_authorized[0].count;

        organizations_authorized.forEach(function(organization) {
          if (organization.image === 'default') {
            organization.image = '/img/logos/medium/group.png';
          } else {
            organization.image = '/img/organizations/' + organization.image;
          }
          organizations.push({
            id: organization.organization_id,
            name: organization.name,
            image: organization.image,
            description: organization.description,
          });
        });
      }
      res.send({ organizations, organizations_number: count });
    })
    .catch(function(error) {
      debug('Error get organizations authorized: ' + error);
      const message = { text: ' Unable to find organizations', type: 'danger' };
      send_response(req, res, message, '/idm');
    });
};

// GET /idm/users/:user_id/edit -- Render a form to edit user profile
exports.edit = function(req, res) {
  debug('--> edit');

  // If message exists in session, copy to locals and delete from session
  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }

  // Set image path
  if (req.user.image === 'default') {
    req.user.image = '/img/logos/original/user.png';
  } else {
    req.user.image = '/img/users/' + req.user.image;
  }

  if (!req.user.gravatar) {
    const url = gravatar.url(
      req.session.user.email,
      { s: 100, r: 'g', d: 404 },
      { protocol: 'https' }
    );

    // Send an http request to gravatar
    https
      .get(url, function(response) {
        response.setEncoding('utf-8');
        debug('  --> Request to gravatar status: ' + response.statusCode);

        // If exists set parameter in req.user
        if (response.statusCode === 200) {
          req.user.image_gravatar = url;
        }

        res.render('users/edit', {
          user: req.user,
          error: [],
          csrf_token: req.csrfToken(),
        });
      })
      .on('error', function(e) {
        debug('Failed connecting to gravatar: ' + e);
        res.render('users/edit', {
          user: req.user,
          error: [],
          csrf_token: req.csrfToken(),
        });
      });
  } else {
    req.user.image_gravatar = gravatar.url(
      req.session.user.email,
      { s: 100, r: 'g', d: 404 },
      { protocol: 'https' }
    );
    res.render('users/edit', {
      user: req.user,
      error: [],
      csrf_token: req.csrfToken(),
    });
  }
};

// PUT /idm/users/:user_id/edit/info -- Update user info
exports.update_info = function(req, res) {
  debug('--> update_info');

  // Build a row and validate if input values are correct (not empty) before saving values in user table
  req.body.user.id = req.session.user.id;
  const user = models.user.build(req.body.user);

  if (
    req.body.user.description.replace(/^\s+/, '').replace(/\s+$/, '') === ''
  ) {
    req.body.user.description = null;
  }

  user
    .validate()
    .then(function() {
      models.user
        .update(
          {
            username: req.body.user.username,
            description: req.body.user.description,
            website: req.body.user.website,
          },
          {
            fields: ['username', 'description', 'website'],
            where: { id: req.session.user.id },
          }
        )
        .then(function() {
          // Send message of success of updating user
          req.session.message = {
            text: ' User updated successfully.',
            type: 'success',
          };
          res.redirect('/idm/users/' + req.session.user.id);
        })
        .catch(function(error) {
          debug('Error updating values of organization ' + error);
          req.session.message = { text: ' Fail update user.', type: 'danger' };
          res.redirect('/idm/users/' + req.session.user.id);
        });
    })
    .catch(function(error) {
      // Send message of warning of updating user
      res.locals.message = { text: ' User update failed.', type: 'warning' };

      if (req.user.gravatar) {
        req.body.gravatar = true;
        req.body.user.image_gravatar = gravatar.url(
          req.user.email,
          { s: 100, r: 'g', d: 'mm' },
          { protocol: 'https' }
        );
      }
      if (req.user.image === 'default') {
        req.body.user.image = '/img/logos/original/user.png';
      } else {
        req.body.user.image = '/img/users/' + req.user.image;
      }
      res.render('users/edit', {
        user: req.body.user,
        error,
        csrf_token: req.csrfToken(),
      });
    });
};

// PUT /idm/users/:user_id/edit/avatar -- Update user avatar
exports.update_avatar = function(req, res) {
  debug('--> update_avatar');

  // See if the user has selected a image to upload
  if (req.file) {
    handle_uploaded_images(req, res, '/idm/users/' + req.session.user.id);

    // If not send error message
  } else {
    req.session.message = { text: ' fail uploading image.', type: 'warning' };
    res.redirect('/idm/users/' + req.user.id);
  }
};

// DELETE /idm/users/:user_id/edit/delete_avatar -- Delete user avatar
exports.delete_avatar = function(req, res) {
  debug('--> delete_avatar');

  const image_path = 'public/img/users/' + req.user.image;

  image
    .destroy(image_path)
    .then(function() {
      return models.user.update(
        { image: 'default' },
        {
          fields: ['image'],
          where: { id: req.user.id },
        }
      );
    })
    .then(function(deleted) {
      if (deleted[0] === 1) {
        // Send message of success in deleting image
        if (req.user.gravatar) {
          req.session.user.image = gravatar.url(
            req.session.user.email,
            { s: 25, r: 'g', d: 'mm' },
            { protocol: 'https' }
          );
        } else {
          req.session.user.image = '/img/logos/small/user.png';
        }
        req.session.message = { text: ' Deleted image.', type: 'success' };
        res.redirect('/idm/users/' + req.user.id + '/edit');
      } else {
        // Send message of fail when deleting an image
        req.session.message = {
          text: ' Failed to delete image.',
          type: 'danger',
        };
        res.redirect('/idm/users/' + req.user.id + '/edit');
      }
    })
    .catch(function(error) {
      debug('Error ', error);
      req.session.message = {
        text: ' Failed to delete image.',
        type: 'danger',
      };
      res.redirect('/idm/users/' + req.user.id + '/edit');
    });
};

// PUT /idm/users/:user_id/edit/avatar/set -- Use avatar as profile image
exports.set_avatar = function(req, res) {
  debug('--> set_avatar');

  models.user
    .update(
      { gravatar: false },
      {
        fields: ['gravatar'],
        where: { id: req.session.user.id },
      }
    )
    .then(function() {
      // Send message of success when updating image
      if (req.user.image === 'default') {
        req.session.user.image = '/img/logos/small/user.png';
      } else {
        req.session.user.image = '/img/users/' + req.user.image;
      }
      req.session.message = { text: ' set avatar.', type: 'success' };
      res.redirect('/idm/users/' + req.user.id);
    })
    .catch(function(error) {
      // Send message of fail when updating image
      res.locals.message = { text: ' set avatar failed.', type: 'warning' };
      res.render('users/edit', {
        user: req.user,
        error,
        csrf_token: req.csrfToken(),
      });
    });
};

// PUT /idm/users/:user_id/edit/gravatar -- Use gravatar as profile image
exports.set_gravatar = function(req, res) {
  debug('--> set_gravatar');

  models.user
    .update(
      { gravatar: true },
      {
        fields: ['gravatar'],
        where: { id: req.session.user.id },
      }
    )
    .then(function() {
      // Send message of success when updating image
      const url = gravatar.url(
        req.session.user.email,
        { s: 25, r: 'g', d: 'mm' },
        { protocol: 'https' }
      );
      req.session.user.image = url;
      req.session.message = { text: ' set gravatar.', type: 'success' };
      res.redirect('/idm/users/' + req.user.id);
    })
    .catch(function(error) {
      // Send message of fail when updating image
      res.locals.message = { text: ' set gravatar failed.', type: 'warning' };
      res.render('users/edit', {
        user: req.user,
        error,
        csrf_token: req.csrfToken(),
      });
    });
};

// MW to see if user is registered
exports.authenticate = external_auth.enabled
  ? require('../../external_auth/authentication_driver').authenticate
  : function(username, password, callback) {
      debug('--> authenticate');

      // Search the user
      models.user
        .find({
          attributes: [
            'id',
            'username',
            'salt',
            'password',
            'enabled',
            'email',
            'gravatar',
            'image',
            'admin',
            'date_password',
            'starters_tour_ended',
          ],
          where: {
            email: username,
          },
        })
        .then(function(user) {
          if (user) {
            // Verify password and if user is enabled to use the web
            if (user.verifyPassword(password) && user.enabled) {
              callback(null, user);
            } else {
              callback(new Error('invalid'));
            }
          } else {
            callback(new Error('user_not_found'));
          }
        })
        .catch(function(error) {
          callback(error);
        });
    };

// GET /sign_up -- View to create a new user
exports.new = function(req, res) {
  debug('--> new');

  res.render('users/new', {
    user_info: {},
    errors: [],
    csrf_token: req.csrfToken(),
  });
};

// POST /sign_up -- Create new user
exports.create = function(req, res) {
  debug('--> create');

  if (config.email_list_type && req.body.email) {
    if (
      config.email_list_type === 'whitelist' &&
      !email_list.includes(req.body.email.split('@')[1])
    ) {
      res.locals.message = { text: ' User creation failed.', type: 'danger' };
      return res.render('users/new', {
        user_info: {},
        errors: [],
        csrf_token: req.csrfToken(),
      });
    }

    if (
      config.email_list_type === 'blacklist' &&
      email_list.includes(req.body.email.split('@')[1])
    ) {
      res.locals.message = { text: ' User creation failed.', type: 'danger' };
      return res.render('users/new', {
        user_info: {},
        errors: [],
        csrf_token: req.csrfToken(),
      });
    }
  }

  // If body has parameters id or secret don't create user
  if (req.body.id) {
    res.locals.message = { text: ' User creation failed.', type: 'danger' };
    return res.render('users/new', {
      user_info: {},
      errors: [],
      csrf_token: req.csrfToken(),
    });
  }
  // Array of errors to send to the view
  let errors = [];

  // Build a row and validate it
  const user = models.user.build({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password1,
    date_password: new Date(new Date().getTime()),
    enabled: false,
  });

  // If password(again) is empty push an error into the array
  if (req.body.password2 === '') {
    errors.push({ message: 'password2' });
  }
  return user
    .validate()
    .then(function() {
      // If the two password are differents, send an error
      if (req.body.password1 !== req.body.password2) {
        errors.push({ message: 'passwordDifferent' });
        throw new Error('passwordDifferent');
      } else {
        // Save the row in the database
        user.save().then(function() {
          const activation_key = Math.random()
            .toString(36)
            .substr(2);
          const activation_expires = new Date(
            new Date().getTime() + 1000 * 3600 * 24
          );

          models.user_registration_profile
            .findOrCreate({
              defaults: {
                user_email: user.email,
                activation_key,
                activation_expires,
              },
              where: { user_email: user.email },
            })
            .then(function(user_prof) {
              user_prof[0].activation_key = activation_key;
              user_prof[0].activation_expires = activation_expires;
              return user_prof[0].save({
                fields: ['activation_key', 'activation_expires'],
              });
            })
            .then(function() {
              if (req.body.use_gravatar) {
                const url = gravatar.url(
                  user.email,
                  { s: 100, r: 'g', d: 404 },
                  { protocol: 'https' }
                );

                // Send an http request to gravatar
                https
                  .get(url, function(response) {
                    response.setEncoding('utf-8');
                    debug(
                      '  --> Request to gravatar status: ' + response.statusCode
                    );

                    // If exists set parameter in req.user
                    if (response.statusCode === 200) {
                      models.user
                        .update(
                          { gravatar: true },
                          {
                            fields: ['gravatar'],
                            where: { id: user.id },
                          }
                        )
                        .then(function() {
                          debug('  --> Gravatar set');
                        })
                        .catch(function(error) {
                          debug('  -> error' + error);
                        });
                    }
                  })
                  .on('error', function(e) {
                    debug('Failed connecting to gravatar: ' + e);
                  });
              }

              // Send an email to the user
              const link =
                config.host +
                '/activate?activation_key=' +
                activation_key +
                '&email=' +
                encodeURIComponent(user.email); // eslint-disable-line snakecase/snakecase

              const mail_data = {
                name: user.username,
                link,
              };

              const translation = req.app.locals.translation;

              // Send an email message to the user
              email.send('activate', '', user.email, mail_data, translation);

              res.locals.message = {
                text:
                  'Account created succesfully, check your email for the confirmation link.',
                type: 'success',
              };
              res.render('index', { errors: [], csrf_token: req.csrfToken() });
            });
        });
      }

      // If validation fails, send an array with all errors found
    })
    .catch(function(error) {
      if (error.message !== 'passwordDifferent') {
        errors = errors.concat(error.errors);
      }
      res.render('users/new', {
        user_info: user,
        errors,
        csrf_token: req.csrfToken(),
      });
    });
};

// GET /activate -- Activate user
exports.activate = function(req, res, next) {
  debug('--> activate');

  // Search the user through the id
  models.user_registration_profile
    .find({
      where: {
        user_email: req.query.email,
      },
      include: [models.user],
    })
    .then(function(user_registration_profile) {
      if (user_registration_profile && user_registration_profile.User) {
        const user = user_registration_profile.User;

        // Activate the user if is not or if the actual date not exceeds the expiration date
        if (user.enabled) {
          res.locals.message = {
            text: 'User already activated',
            type: 'warning',
          };
          res.render('index', { errors: [], csrf_token: req.csrfToken() });
        } else if (
          user_registration_profile.activation_key === req.query.activation_key
        ) {
          if (
            new Date().getTime() >
            user_registration_profile.activation_expires.getTime()
          ) {
            res.locals.message = {
              text: 'Error activating user',
              type: 'danger',
            };
            res.render('index', { errors: [], csrf_token: req.csrfToken() });
          } else {
            user.enabled = true;
            user.save().then(function() {
              res.locals.message = {
                text: 'User activated. login using your credentials.',
                type: 'success',
              };
              res.render('index', { errors: [], csrf_token: req.csrfToken() });
            });
          }
        } else {
          res.locals.message = {
            text: 'Error activating user',
            type: 'danger',
          };
          res.render('index', { errors: [], csrf_token: req.csrfToken() });
        }
      } else {
        res.locals.message = { text: 'Error activating user', type: 'danger' };
        res.render('index', { errors: [], csrf_token: req.csrfToken() });
      }
    })
    .catch(function(error) {
      next(error);
    });
};

// GET /password/request -- Render a view with instructions to reset password
exports.password_request = function(req, res) {
  debug('--> password_request');

  res.render('auth/password_request', {
    error: '',
    csrf_token: req.csrfToken(),
  });
};

// POST /password/request -- Send an email with instructions to reset password
exports.password_send_email = function(req, res) {
  debug('--> password_send_email');

  if (!req.body.email) {
    res.render('auth/password_request', {
      error: 'empty_field',
      csrf_token: req.csrfToken(),
    });
  } else {
    models.user
      .findOne({
        where: { email: req.body.email },
      })
      .then(function(user) {
        if (!user) {
          res.locals.message = {
            text: `Sorry. You have specified an email address that is not registered.
                                               If your problem persists, please contact: fiware-lab-help@lists.fiware.org`,
            type: 'danger',
          };
          res.render('auth/password_request', {
            error: '',
            csrf_token: req.csrfToken(),
          });
        } else if (!user.enabled) {
          res.locals.message = {
            text: `The email address you have specified is registered but not activated.
                                               Please check your email for the activation link or request a new one.
                                               If your problem persists, please contact: fiware-lab-help@lists.fiware.org`,
            type: 'danger',
          };
          res.render('auth/password_request', {
            error: '',
            csrf_token: req.csrfToken(),
          });
        } else {
          const reset_key = Math.random()
            .toString(36)
            .substr(2);
          const reset_expires = new Date(
            new Date().getTime() + 1000 * 3600 * 24
          );

          models.user_registration_profile
            .findOrCreate({
              defaults: {
                user_email: user.email,
                reset_key,
                reset_expires,
              },
              where: { user_email: user.email },
            })
            .then(function(user_prof) {
              user_prof[0].reset_key = reset_key;
              user_prof[0].reset_expires = reset_expires;
              return user_prof[0].save({
                fields: ['reset_key', 'reset_expires'],
              });
            })
            .then(function() {
              // Send an email to the user
              const link =
                config.host +
                '/password/reset?reset_key=' +
                reset_key +
                '&email=' +
                user.email;

              const mail_data = {
                name: user.username,
                link,
              };

              const translation = req.app.locals.translation;
              // Send an email message to the user
              email.send(
                'forgot_password',
                '',
                user.email,
                mail_data,
                translation
              );

              req.session.message = {
                text: 'Reset password instructions send to ' + user.email,
                type: 'success',
              };
              res.redirect('/auth/login');
            })
            .catch(function(error) {
              debug('  -> error' + error);
              res.redirect('/');
            });
        }
      })
      .catch(function(error) {
        debug('  -> error' + error);
        res.redirect('/');
      });
  }
};

// GET /password/reset -- Render a view to change password
exports.new_password = function(req, res) {
  debug('--> new_password');

  res.render('auth/password_reset', {
    key: req.query.reset_key,
    email: req.query.email,
    errors: [],
    csrf_token: req.csrfToken(),
  });
};

// POST /password/reset -- Set new password in database
exports.change_password = function(req, res) {
  debug('--> change_password');

  const errors = [];

  // If password new is empty push an error into the array
  if (req.body.password1 === '') {
    errors.push('password');
  }

  // If password(again) is empty push an error into the array
  if (req.body.password2 === '') {
    errors.push('confirm_password');
  }

  // If the two password are differents, send an error
  if (req.body.password1 !== req.body.password2) {
    errors.push('password_different');
  }

  // Search the user through the email
  models.user_registration_profile
    .find({
      where: {
        user_email: req.query.email,
      },
      include: [models.user],
    })
    .then(function(user_registration_profile) {
      const user = user_registration_profile.User;
      if (user) {
        if (user_registration_profile.reset_key === req.query.reset_key) {
          if (
            new Date().getTime() >
            user_registration_profile.reset_expires.getTime()
          ) {
            res.locals.message = {
              text: 'Error reseting user password',
              type: 'danger',
            };
            res.render('index', { errors: [], csrf_token: req.csrfToken() });
          } else if (errors.length > 0) {
            res.render('auth/password_reset', {
              key: req.query.reset_key,
              email: req.query.email,
              errors,
              csrf_token: req.csrfToken(),
            });
          } else {
            user.password = req.body.password1;
            user.date_password = new Date(new Date().getTime());
            user
              .save()
              .then(function() {
                req.session.message = {
                  text: ' Password successfully changed',
                  type: 'success',
                };
                res.redirect('/auth/login');
              })
              .catch(function(error) {
                debug('  -> error' + error);
                res.redirect('/auth/login');
              });
          }
        } else {
          res.locals.message = {
            text: 'Error reseting user password',
            type: 'danger',
          };
          res.render('index', { errors: [], csrf_token: req.csrfToken() });
        }
      } else {
        res.locals.message = {
          text: 'Error reseting user password',
          type: 'danger',
        };
        res.render('index', { errors: [], csrf_token: req.csrfToken() });
      }
    })
    .catch(function(error) {
      debug(error);
    });
};

// GET /confirmation -- Render a view with instructions to resend confirmation
exports.confirmation = function(req, res) {
  debug('--> confirmation');

  res.render('auth/confirmation', { error: '', csrf_token: req.csrfToken() });
};

// POST /confirmation -- Send a new message of activation to the user
exports.resend_confirmation = function(req, res) {
  debug('--> resend_confirmation');

  if (!req.body.email) {
    res.render('auth/confirmation', {
      error: 'empty_field',
      csrf_token: req.csrfToken(),
    });
  } else {
    models.user
      .findOne({
        where: { email: req.body.email },
      })
      .then(function(user) {
        if (user) {
          if (user.enabled) {
            res.locals.message = {
              text: ' User was already activated, please try signing in',
              type: 'danger',
            };
            res.render('auth/confirmation', {
              error: '',
              csrf_token: req.csrfToken(),
            });
          } else {
            const activation_key = Math.random()
              .toString(36)
              .substr(2);
            const activation_expires = new Date(
              new Date().getTime() + 1000 * 3600 * 24
            );

            models.user_registration_profile
              .update(
                {
                  user_email: user.email,
                  activation_key,
                  activation_expires,
                },
                {
                  fields: ['activation_key', 'activation_expires'],
                  where: { user_email: user.email },
                }
              )
              .then(function() {
                // Send an email to the user
                const link =
                  config.host +
                  '/activate?activation_key=' +
                  activation_key +
                  '&email=' +
                  user.email;

                const mail_data = {
                  name: user.username,
                  link,
                };

                const translation = req.app.locals.translation;

                // Send an email message to the user
                email.send('activate', '', user.email, mail_data, translation);

                req.session.message = {
                  text:
                    'Resend confirmation instructions email to ' + user.email,
                  type: 'success',
                };
                res.redirect('/auth/login');
              })
              .catch(function(error) {
                debug('  -> error' + error);
                throw new Error(error);
              });
          }
        } else {
          res.locals.message = {
            text: `Sorry. You have specified an email address that is not registerd.
                                               If your problem persists, please contact: fiware-lab-help@lists.fiware.org`,
            type: 'danger',
          };
          res.render('auth/confirmation', {
            error: '',
            csrf_token: req.csrfToken(),
          });
        }
      })
      .catch(function(error) {
        debug('  -> error' + error);
        res.redirect('/');
      });
  }
};

// PUT /tour_ended -- Send a new message of activation to the user
exports.starter_tour_ended = function(req, res) {
  debug('--> starter_tour_ended');

  models.user
    .update(
      { starters_tour_ended: true },
      {
        fields: ['starters_tour_ended'],
        where: { id: req.session.user.id },
      }
    )
    .then(function() {
      req.session.user.starters_tour_ended = true;
      res.send('tour ended');
    })
    .catch(function(error) {
      debug('Error: ', error);
      // Send message of fail when setting tour ended
      res.send('tour ended failed');
    });
};

// Function to check and crop an image and to update the name in the oauth_client table
function handle_uploaded_images(req, res, redirect_uri) {
  // Check the MIME of the file upload
  const image_path = 'public/img/users/' + req.file.filename;
  image
    .check(image_path)
    .then(function() {
      const crop_points = {
        x: req.body.x,
        y: req.body.y,
        w: req.body.w,
        h: req.body.h,
      };
      return image.crop(image_path, crop_points);
    })
    .then(function() {
      return models.user.update(
        { image: req.file.filename },
        {
          fields: ['image'],
          where: { id: req.user.id },
        }
      );
    })
    .then(function(updated) {
      const old_image = 'public/img/users/' + req.user.image;
      if (updated[0] === 1) {
        // Old image to be deleted
        if (!old_image.includes('default')) {
          req.session.user.image = '/img/users/' + req.file.filename;
          delete_image(
            req,
            res,
            old_image,
            true,
            redirect_uri,
            ' Image updated successfully.'
          );
        } else {
          // Send message of success when updating image
          req.session.user.image = '/img/users/' + req.file.filename;
          req.session.message = {
            text: ' Image updated successfully.',
            type: 'success',
          };
          res.redirect(redirect_uri);
        }
      } else {
        delete_image(
          req,
          res,
          image_path,
          false,
          redirect_uri,
          ' Image not updated.'
        );
      }
    })
    .catch(function(error) {
      const message =
        typeof error === 'string' ? error : ' Error saving image.';
      delete_image(req, res, image_path, false, redirect_uri, message);
    });
}

// Function to delete an image
function delete_image(req, res, image_path, success, redirect_uri, message) {
  image
    .destroy(image_path)
    .then(function() {
      req.session.user.image = '/img/users/' + req.file.filename;
      req.session.message = {
        text: message,
        type: success ? 'success' : 'danger',
      };
      res.redirect(success ? redirect_uri : '/idm/users/' + req.user.id);
    })
    .catch(function(error) {
      debug('Error: ', error);
      req.session.message = { text: ' Error saving image.', type: 'danger' };
      res.redirect('/idm/users/' + req.user.id);
    });
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

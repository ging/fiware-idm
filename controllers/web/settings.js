const models = require('../../models/models.js');
const debug = require('debug')('idm:web-settings_controller');
const config = require('../../config');
const email = require('../../lib/email.js');
const fs = require('fs');
const path = require('path');

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

// GET /idm/settings -- Render settings view
exports.settings = function(req, res) {
  debug('--> settings');

  res.render('settings/settings', { csrf_token: req.csrfToken() });
};

// POST /idm/settings/password -- Change password
exports.password = function(req, res) {
  debug('--> password');

  const errors = [];

  // If password new is empty push an error into the array
  if (req.body.new_password === '') {
    errors.push('new_password');
  }

  // If password(again) is empty push an error into the array
  if (req.body.confirm_password === '') {
    errors.push('confirm_password');
  }

  // If current password is empty send a message
  if (req.body.current_password === '') {
    errors.push('current_password');
  }

  // If the two password are differents, send an error
  if (req.body.new_password !== req.body.confirm_password) {
    errors.push('password_different');
  }

  // If there are erros render the view with them. If not check password of user
  if (errors.length > 0) {
    res.render('settings/change_password', {
      errors,
      warn_change_password: false,
      csrf_token: req.csrfToken(),
    });
  } else {
    // Search the user through the email
    models.user
      .find({
        where: {
          id: req.session.user.id,
        },
      })
      .then(function(user) {
        if (user) {
          // Verify password and if user is enabled to use the web
          if (user.verifyPassword(req.body.current_password)) {
            models.user
              .update(
                {
                  password: req.body.new_password,
                  date_password: new Date(new Date().getTime()),
                },
                {
                  fields: ['password', 'date_password'],
                  where: { id: req.session.user.id },
                }
              )
              .then(function() {
                delete req.session.user;
                req.session.errors = [{ message: 'password_change' }];
                res.redirect('/auth/login');
              })
              .catch(function(error) {
                debug('  -> error' + error);
                res.redirect('/auth/login');
              });
          } else {
            res.locals.message = {
              text: 'Unable to change password. Unauthorized',
              type: 'danger',
            };
            res.render('settings/change_password', {
              errors,
              warn_change_password: false,
              csrf_token: req.csrfToken(),
            });
          }
        } else {
          throw new Error('invalid');
        }
      })
      .catch(function(error) {
        debug(error); /*callback(error)*/
      });
  }
};

// POST /idm/settings/email -- Set new email address
exports.email = function(req, res) {
  debug('--> email');

  const errors = [];

  if (config.email_list_type && req.body.email) {
    if (
      config.email_list_type === 'whitelist' &&
      !email_list.includes(req.body.email.split('@')[1])
    ) {
      res.locals.message = { text: ' Email change failed.', type: 'danger' };
      return res.render('settings/change_email', {
        errors,
        csrf_token: req.csrfToken(),
      });
    }

    if (
      config.email_list_type === 'blacklist' &&
      email_list.includes(req.body.email.split('@')[1])
    ) {
      res.locals.message = { text: ' Email change failed.', type: 'danger' };
      return res.render('settings/change_email', {
        errors,
        csrf_token: req.csrfToken(),
      });
    }
  }

  // If password new is empty push an error into the array
  if (req.body.email === '') {
    errors.push('email');
  }

  // If password(again) is empty push an error into the array
  if (req.body.password === '') {
    errors.push('password');
  }

  // If there are erros render the view with them. If not check password of user
  if (errors.length > 0) {
    return res.render('settings/change_email', {
      errors,
      csrf_token: req.csrfToken(),
    });
  }

  // If is the actual email send a message of error to the user
  if (req.session.user.email === req.body.email) {
    res.locals.message = { text: ' It is your actual email.', type: 'warning' };
    res.render('settings/change_email', {
      errors,
      csrf_token: req.csrfToken(),
    });
  }
  return models.user
    .findOne({
      where: { email: req.body.email },
    })
    .then(function(user) {
      if (user) {
        res.locals.message = { text: ' Email already used.', type: 'danger' };
        res.render('settings/change_email', {
          errors,
          csrf_token: req.csrfToken(),
        });
      } else {
        // Search the user through the email
        models.user
          .find({
            where: {
              id: req.session.user.id,
            },
          })
          .then(function(user) {
            if (user) {
              // Verify password and if user is enabled to use the web
              if (user.verifyPassword(req.body.password)) {
                const verification_key = Math.random()
                  .toString(36)
                  .substr(2);
                const verification_expires = new Date(
                  new Date().getTime() + 1000 * 3600 * 24
                );

                models.user_registration_profile
                  .findOrCreate({
                    defaults: {
                      user_email: user.email,
                      verification_key,
                      verification_expires,
                    },
                    where: { user_email: user.email },
                  })
                  .then(function(user_prof) {
                    user_prof[0].verification_key = verification_key;
                    user_prof[0].verification_expires = verification_expires;
                    return user_prof[0].save({
                      fields: ['verification_key', 'verification_expires'],
                    });
                  })
                  .then(function() {
                    // Send an email to the user
                    const link =
                      config.host +
                      '/idm/settings/email/verify?verification_key=' +
                      verification_key +
                      '&new_email=' +
                      req.body.email;

                    const mail_data = {
                      name: user.username,
                      link,
                    };

                    const translation = req.app.locals.translation;

                    // Send an email message to the user
                    email.send(
                      'change_email',
                      '',
                      req.body.email,
                      mail_data,
                      translation
                    );

                    res.locals.message = {
                      text: `An emails has been sent to verify your account.
				            								  Follow the provided link to change your email`,
                      type: 'success',
                    };
                    res.render('settings/settings', {
                      csrf_token: req.csrfToken(),
                    });
                  })
                  .catch(function(error) {
                    debug('  -> error' + error);
                    res.redirect('/');
                  });
              } else {
                res.locals.message = {
                  text: 'Invalid password',
                  type: 'danger',
                };
                res.render('settings/change_email', {
                  errors,
                  csrf_token: req.csrfToken(),
                });
              }
            } else {
              throw new Error('invalid');
            }
          })
          .catch(function(error) {
            throw error;
          });
      }
    })
    .catch(function(error) {
      debug('  -> error' + error);
      res.redirect('/');
    });
};

// GET /idm/settings/email/verify -- Confirm change of email
exports.email_verify = function(req, res) {
  debug('--> email_verify');

  if (req.session.user) {
    // Search the user through the id
    models.user_registration_profile
      .find({
        where: {
          verification_key: req.query.verification_key,
          user_email: req.session.user.email,
        },
        include: [models.user],
      })
      .then(function(user_registration_profile) {
        const user = user_registration_profile.User;
        delete user_registration_profile.User;
        if (
          user_registration_profile.verification_key ===
          req.query.verification_key
        ) {
          if (
            new Date().getTime() >
            user_registration_profile.verification_expires.getTime()
          ) {
            res.locals.message = {
              text: 'Error changing email address',
              type: 'danger',
            };
            res.render('index', { errors: [], csrf_token: req.csrfToken() });
          } else {
            models.user
              .update(
                {
                  email: req.query.new_email,
                },
                {
                  fields: ['email'],
                  where: { email: user.email },
                }
              )
              .then(function() {
                req.session.user.email = req.query.new_email;
                res.locals.message = {
                  text: ' Email successfully changed',
                  type: 'success',
                };
                res.render('settings/settings', {
                  csrf_token: req.csrfToken(),
                });
              })
              .catch(function(error) {
                debug('  -> error ' + error);
                res.redirect('/');
              });
          }
        }
      })
      .catch(function(error) {
        debug('  -> error' + error);
        res.redirect('/');
      });
  } else {
    req.session.message = {
      text: ' You need to be logged to change email address.',
      type: 'danger',
    };
    res.redirect('/auth/login');
  }
};

// DELETE /idm/settings/cancel -- cancle account of user logged
exports.cancel_account = function(req, res) {
  debug('--> cancel_account');

  models.user
    .destroy({
      where: { id: req.session.user.id },
    })
    .then(function(destroyed) {
      if (destroyed) {
        delete req.session.user;
        req.session.message = {
          text: 'Account cancelled succesfully.',
          type: 'success',
        };
        res.redirect('/auth/login');
      } else {
        req.session.message = { text: 'Account not cancelled', type: 'danger' };
        res.redirect('/');
      }
    })
    .catch(function(error) {
      debug('  -> error' + error);
      res.redirect('/');
    });
};

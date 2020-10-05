const models = require('../../models/models.js');
const debug = require('debug')('idm:web-settings_controller');
const config_service = require('../../lib/configService.js');
const config = config_service.get_config();
const email = require('../../lib/email.js');
const fs = require('fs');
const path = require('path');
const image = require('../../lib/image.js');

const Speakeasy = require('speakeasy');
const Qrcode = require('qrcode');

const email_list = config.email_list_type
  ? fs
      .readFileSync(path.join(__dirname, '../../etc/email_list/' + config.email_list_type + '.txt'))
      .toString('utf-8')
      .split('\n')
  : [];

// GET /idm/settings -- Render settings view
exports.settings = function (req, res) {
  debug('--> settings');

  res.render('settings/settings', {
    csrf_token: req.csrfToken(),
    enable_2fa: config.enable_2fa
  });
};

// POST /idm/settings/password -- Change password
exports.password = function (req, res) {
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
      csrf_token: req.csrfToken()
    });
  } else {
    // Search the user through the email
    models.user
      .find({
        where: {
          id: req.session.user.id
        }
      })
      .then(function (user) {
        if (user) {
          // Verify password and if user is enabled to use the web
          if (user.verifyPassword(req.body.current_password)) {
            models.user
              .update(
                {
                  password: req.body.new_password,
                  date_password: new Date(new Date().getTime())
                },
                {
                  fields: ['password', 'date_password'],
                  where: { id: req.session.user.id }
                }
              )
              .then(function () {
                delete req.session.user;
                req.session.errors = [{ message: 'password_change' }];
                res.redirect('/auth/login');
              })
              .catch(function (error) {
                debug('  -> error' + error);
                res.redirect('/auth/login');
              });
          } else {
            res.locals.message = {
              text: 'Unable to change password. Unauthorized',
              type: 'danger'
            };
            res.render('settings/change_password', {
              errors,
              warn_change_password: false,
              csrf_token: req.csrfToken()
            });
          }
        } else {
          throw new Error('invalid');
        }
      })
      .catch(function (error) {
        debug(error); /*callback(error)*/
      });
  }
};

// POST /idm/settings/email -- Set new email address
exports.email = function (req, res) {
  debug('--> email');

  const errors = [];

  if (config.email_list_type && req.body.email) {
    if (config.email_list_type === 'whitelist' && !email_list.includes(req.body.email.split('@')[1])) {
      res.locals.message = { text: ' Email change failed.', type: 'danger' };
      return res.render('settings/change_email', {
        errors,
        csrf_token: req.csrfToken()
      });
    }

    if (config.email_list_type === 'blacklist' && email_list.includes(req.body.email.split('@')[1])) {
      res.locals.message = { text: ' Email change failed.', type: 'danger' };
      return res.render('settings/change_email', {
        errors,
        csrf_token: req.csrfToken()
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
      csrf_token: req.csrfToken()
    });
  }

  // If is the actual email send a message of error to the user
  if (req.session.user.email === req.body.email) {
    res.locals.message = { text: ' It is your actual email.', type: 'warning' };
    res.render('settings/change_email', {
      errors,
      csrf_token: req.csrfToken()
    });
  }
  return models.user
    .findOne({
      where: { email: req.body.email }
    })
    .then(function (user) {
      if (user) {
        res.locals.message = { text: ' Email already used.', type: 'danger' };
        res.render('settings/change_email', {
          errors,
          csrf_token: req.csrfToken()
        });
      } else {
        // Search the user through the email
        models.user
          .find({
            where: {
              id: req.session.user.id
            }
          })
          .then(function (user) {
            if (user) {
              // Verify password and if user is enabled to use the web
              if (user.verifyPassword(req.body.password)) {
                const verification_key = Math.random().toString(36).substr(2);
                const verification_expires = new Date(new Date().getTime() + 1000 * 3600 * 24);

                models.user_registration_profile
                  .findOrCreate({
                    defaults: {
                      user_email: user.email,
                      verification_key,
                      verification_expires
                    },
                    where: { user_email: user.email }
                  })
                  .then(function (user_prof) {
                    user_prof[0].verification_key = verification_key;
                    user_prof[0].verification_expires = verification_expires;
                    return user_prof[0].save({
                      fields: ['verification_key', 'verification_expires']
                    });
                  })
                  .then(function () {
                    // Send an email to the user
                    const link =
                      config.host +
                      '/idm/settings/email/verify?verification_key=' +
                      verification_key +
                      '&new_email=' +
                      req.body.email;

                    const mail_data = {
                      name: user.username,
                      link
                    };

                    const translation = req.app.locals.translation;

                    // Send an email message to the user
                    email.send('change_email', '', req.body.email, mail_data, translation);

                    res.locals.message = {
                      text: `An emails has been sent to verify your account.
				            								  Follow the provided link to change your email`,
                      type: 'success'
                    };
                    res.render('settings/settings', {
                      csrf_token: req.csrfToken(),
                      enable_2fa: config.enable_2fa
                    });
                  })
                  .catch(function (error) {
                    debug('  -> error' + error);
                    res.redirect('/');
                  });
              } else {
                res.locals.message = {
                  text: 'Invalid password',
                  type: 'danger'
                };
                res.render('settings/change_email', {
                  errors,
                  csrf_token: req.csrfToken()
                });
              }
            } else {
              throw new Error('invalid');
            }
          })
          .catch(function (error) {
            throw error;
          });
      }
    })
    .catch(function (error) {
      debug('  -> error' + error);
      res.redirect('/');
    });
};

// GET /idm/settings/email/verify -- Confirm change of email
exports.email_verify = function (req, res) {
  debug('--> email_verify');

  if (req.session.user) {
    // Search the user through the id
    models.user_registration_profile
      .find({
        where: {
          verification_key: req.query.verification_key,
          user_email: req.session.user.email
        },
        include: [models.user]
      })
      .then(function (user_registration_profile) {
        const user = user_registration_profile.User;
        delete user_registration_profile.User;
        if (user_registration_profile.verification_key === req.query.verification_key) {
          if (new Date().getTime() > user_registration_profile.verification_expires.getTime()) {
            res.locals.message = {
              text: 'Error changing email address',
              type: 'danger'
            };
            res.render('index', { errors: [], csrf_token: req.csrfToken() });
          } else {
            models.user
              .update(
                {
                  email: req.query.new_email
                },
                {
                  fields: ['email'],
                  where: { email: user.email }
                }
              )
              .then(function () {
                req.session.user.email = req.query.new_email;
                res.locals.message = {
                  text: ' Email successfully changed',
                  type: 'success'
                };
                res.render('settings/settings', {
                  csrf_token: req.csrfToken(),
                  enable_2fa: config.enable_2fa
                });
              })
              .catch(function (error) {
                debug('  -> error ' + error);
                res.redirect('/');
              });
          }
        }
      })
      .catch(function (error) {
        debug('  -> error' + error);
        res.redirect('/');
      });
  } else {
    req.session.message = {
      text: ' You need to be logged to change email address.',
      type: 'danger'
    };
    res.redirect('/auth/login');
  }
};

// DELETE /idm/settings/cancel -- cancle account of user logged
exports.cancel_account = function (req, res) {
  debug('--> cancel_account');

  let user_image;
  models.user
    .findById(req.session.user.id)
    .then(function (user) {
      if (user) {
        user_image = user.image;
        return user.destroy();
      }
      req.session.message = { text: 'Account not cancelled', type: 'danger' };
      return res.redirect('/');
    })
    .then(function () {
      return image.destroy('public/img/users/' + user_image);
    })
    .then(function () {
      delete req.session.user;
      req.session.message = {
        text: 'Account cancelled succesfully.',
        type: 'success'
      };
      res.redirect('/auth/login');
    })
    .catch(function (error) {
      debug('  -> error' + error);
      res.redirect('/');
    });
};

// POST /idm/settings/enable_tfa -- Enable tfa
exports.enable_tfa = function (req, res) {
  debug('--> enable_tfa');
  const errors = [];
  const secret = Speakeasy.generateSecret({
    // length: 20,
    name: req.session.user.username,
    issuer: 'IdM'
  });
  const url = Speakeasy.otpauthURL({
    secret: secret.base32,
    label: req.session.user.username,
    issuer: 'IdM',
    encoding: 'base32'
  });

  // QR code module to generate a QR code that stores the data in secret.otpauth_url,
  //and then display the QR code to the user. This generates a PNG data URL.
  Qrcode.toDataURL(url, function (err, data_url) {
    return res.render('settings/enable_tfa', {
      errors,
      user: req.session.user,
      secret: secret.base32,
      qr: data_url,
      csrf_token: req.csrfToken()
    });
  });
};

// POST /idm/settings/enable_tfa_verify -- Verify elements for tfa
exports.enable_tfa_verify = function (req, res) {
  debug('--> enable_tfa_verify');
  const user_token = req.body.token;
  const temp_secret = req.body.secret;
  const data_url = req.body.qr;

  //Verify the token
  const verified = Speakeasy.totp.verify({
    secret: temp_secret,
    encoding: 'base32',
    token: user_token,
    window: 0
  });
  const errors = [];

  // If the token is valid
  if (verified) {
    //Store Secret
    const user = models.user.build(req.session.user);
    const user_extra = user.extra;

    user_extra.tfa = {
      question: req.body.security_question,
      answer: req.body.security_answer,
      enabled: true,
      secret: req.body.secret
    };

    models.user
      .update(
        {
          extra: user_extra
        },
        {
          where: { id: req.session.user.id }
        }
      )
      .then(function () {
        res.render('settings/settings', {
          csrf_token: req.csrfToken(),
          enable_2fa: config.enable_2fa
        });
      })
      .catch(function (error) {
        debug('Error updating values of user ' + error);

        res.redirect('/');
      });
    // });
  } else {
    errors.push('wrong_token');
    debug('wrong_token');

    res.render('settings/enable_tfa', {
      errors,
      csrf_token: req.csrfToken(),
      secret: temp_secret,
      qr: data_url
    });
  }
};
// POST /idm/settings/disable_tfa_verify -- DIsable tfa
exports.disable_tfa = function (req, res) {
  debug('--> disable_tfa');

  const user = models.user.build(req.session.user);
  const user_extra = user.extra;
  user_extra.tfa = {};

  models.user
    .update(
      {
        extra: user_extra
      },
      {
        where: { id: req.session.user.id }
      }
    )
    .then(function () {
      res.render('settings/settings', {
        csrf_token: req.csrfToken(),
        enable_2fa: config.enable_2fa
      });
    })
    .catch(function (error) {
      debug('Error updating values of user ' + error);

      res.redirect('/');
    });
};

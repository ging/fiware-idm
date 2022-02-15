const gravatar = require('gravatar');
const debug = require('debug')('idm:web-session_controller');
const config = require('../../config');

const models = require('../../models/models.js');
const user_controller = require('./users');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const Speakeasy = require('speakeasy');

const escape_paths = require('../../etc/escape_paths/paths.json').paths;
const email = require('../../lib/email.js');

// MW to authorized restricted http accesses
exports.login_required = function (req, res, next) {
  debug('--> login_required');

  if (req.session.user || check_path(req.path)) {
    next();
  } else {
    req.session.errors = [{ message: 'sessionExpired' }];
    res.redirect('/auth/login');
  }
};

// MW to perform actions forgot password and re send confirmation of registration
exports.login_not_required = function (req, res, next) {
  debug('--> login_not_required');
  if (req.session.user) {
    res.redirect('/');
  } else {
    next();
  }
};

// MW to see if user needs to change password
exports.password_check_date = function (req, res, next) {
  debug('--> password_check_date');

  if (check_path(req.path)) {
    next();
  } else {
    const today = new Date(new Date().getTime());
    const milli_seconds_per_day = 24 * 60 * 60 * 1000;

    const days_since_change = Math.round((today - req.session.user.change_password) / milli_seconds_per_day);

    if (days_since_change > 365) {
      req.session.change_password = true;
      res.redirect('/update_password');
    } else {
      next();
    }
  }
};

// Check if path is included in the list of paths which not need a user session to be accessed
function check_path(path) {
  if (escape_paths.length > 0) {
    for (let i = 0; i < escape_paths.length; i++) {
      if (path.includes(escape_paths[i])) {
        return true;
      }
    }
    return false;
  }
  return true;
}

// GET /auth/login -- Form for login
exports.new = function (req, res) {
  debug('--> new');

  const errors = req.session.errors || {};
  delete req.session.errors;
  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }
  res.render('index', { errors, csrf_token: req.csrfToken() });
};

// POST /auth/login -- Create Session
exports.create = function (req, res) {
  debug('--> create');

  // If inputs email or password are empty create an array of errors
  const errors = [];
  if (!req.body.email) {
    errors.push({ message: 'email' });
  }
  if (!req.body.password) {
    errors.push({ message: 'password' });
  }

  if (req.body.email && req.body.password) {
    // Authenticate user using user controller function
    user_controller.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error) {
        // If error exists send a message to /auth/login
        req.session.errors = [{ message: error.message }];
        res.redirect('/auth/login');
        debug(error);
        return;
      }
      // Create req.session.user and save id and username
      // The session is defined by the existence of: req.session.user
      let image = '/img/logos/small/user.png';
      if (user.gravatar) {
        image = gravatar.url(user.email, { s: 25, r: 'g', d: 'mm' }, { protocol: 'https' });
      } else if (user.image !== 'default') {
        image = '/img/users/' + user.image;
      }

      if (user.extra && user.extra.tfa && user.extra.tfa.enabled) {
        debug('--> two factor authentication enabled');

        const user_agent = req.headers['user-agent'];

        if (user.extra.tfa.user_agent != null && user.extra.tfa.user_agent.includes(user_agent)) {
          debug('-->familiar device');
          req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            image,
            change_password: user.date_password,
            starters_tour_ended: user.starters_tour_ended,
            extra: user.extra
          };
          // If user is admin add parameter to session
          if (user.admin) {
            req.session.user.admin = user.admin;
          }
          res.redirect('/idm');
        } else {
          debug('Loaded stored secret');

          //QR code module to generate a QR code that stores the data in secret.otpauth_url,
          //and then display the QR code to the user. This generates a PNG data URL.
          res.render('auth/tfa', {
            user,
            errors,
            csrf_token: req.csrfToken()
          });
        }
      } else {
        // In case that the user does not use the tfa, create session
        debug('--> two factor authentication disabled');
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          image,
          change_password: user.date_password,
          starters_tour_ended: user.starters_tour_ended,
          extra: user.extra
        };

        // If user is admin add parameter to session
        if (user.admin) {
          req.session.user.admin = user.admin;
        }
        res.redirect('/idm');
      }
    });
  } else {
    debug(errors);
    // If error exists send a message to /auth/login
    req.session.errors = errors;
    res.redirect('/auth/login');
  }
};

// // POST security_question -- Render auth/security_question view to complete tfa without introducing token
// exports.security_question = function(req, res) {
//   debug(req.body.user_id);
//   //Obtains user data
//   models.user
//     .find({
//       attributes: [
//         'id',
//         'username',
//         'salt',
//         'password',
//         'enabled',
//         'email',
//         'gravatar',
//         'image',
//         'admin',
//         'date_password',
//         'starters_tour_ended',
//         'extra',
//       ],
//       where: {
//         id: req.body.user_id,
//       },
//     })
//     .then(function(user) {
//       res.render('auth/security_question', {
//         errors: [],
//         user,
//         csrf_token: req.csrfToken(),
//       });
//     });
// };

// GET /auth/avoid_2fa -- Render auth/avoid_2fa view to complete tfa without introducing token
exports.avoid_2fa = function (req, res) {
  debug('--> avoid_2fa');
  res.render('auth/2fa_avoid', {
    errors: [],
    csrf_token: req.csrfToken()
  });
};

// POST /auth/avoid_2fa -- Disable 2fa
exports.avoid_2fa_email = function (req, res) {
  debug('--> avoid_2fa_email');

  if (!req.body.email) {
    res.render('auth/2fa_avoid', {
      error: 'empty_field',
      csrf_token: req.csrfToken()
    });
  } else {
    models.user
      .findOne({
        where: { email: req.body.email }
      })
      .then(function (user) {
        if (user) {
          const disable_2fa_key = Math.random().toString(36).substr(2);
          const disable_2fa_expires = new Date(new Date().getTime() + 1000 * 3600);

          models.user_registration_profile
            .findOrCreate({
              defaults: {
                user_email: user.email,
                disable_2fa_key,
                disable_2fa_expires
              },
              where: { user_email: user.email }
            })
            .then(function (user_prof) {
              user_prof[0].disable_2fa_key = disable_2fa_key;
              user_prof[0].disable_2fa_expires = disable_2fa_expires;
              return user_prof[0].save({
                fields: ['disable_2fa_key', 'disable_2fa_expires']
              });
            })
            .then(function () {
              // Send an email to the user
              const link =
                config.host + '/auth/disable_2fa?disable_2fa_key=' + disable_2fa_key + '&email=' + user.email;

              const mail_data = {
                name: user.username,
                link
              };

              const translation = req.app.locals.translation;
              const lang = req.app.locals.lang;

              // Send an email message to the user
              email.send('disable_2fa', '', user.email, mail_data, translation, lang);

              req.session.message = {
                text: 'Send instructions email to ' + user.email,
                type: 'success'
              };
              res.redirect('/auth/login');
            })
            .catch(function (error) {
              debug('  -> error ' + error);
              throw new Error(error);
            });
        } else {
          res.locals.message = {
            text: `Sorry. You have specified an email address that is not registerd.
                                               If your problem persists, please contact: fiware-lab-help@lists.fiware.org`,
            type: 'danger'
          };
          res.render('index', {
            errors: {},
            csrf_token: req.csrfToken()
          });
        }
      })
      .catch(function (error) {
        debug('  -> error ' + error);
        res.redirect('/');
      });
  }
};

// GET /auth/disable_2fa -- Render auth/avoid_2fa view to complete tfa without introducing token
exports.disable_2fa = function (req, res, next) {
  debug('--> disable_2fa');

  debug(req.query);

  // Search the user through the id
  models.user_registration_profile
    .findOne({
      where: {
        user_email: req.query.email,
        disable_2fa_key: req.query.disable_2fa_key
      },
      include: [models.user]
    })
    .then(function (user_registration_profile) {
      if (user_registration_profile && user_registration_profile.User) {
        const user = user_registration_profile.User;

        if (new Date().getTime() > user_registration_profile.disable_2fa_expires.getTime()) {
          res.locals.message = {
            text: 'Error disabling 2 factor authentication',
            type: 'danger'
          };
          res.render('index', { errors: [], csrf_token: req.csrfToken() });
        } else {
          //Disable tfa
          const user_extra = user.extra;
          user_extra.tfa = {};
          models.user.update({ extra: user_extra }, { where: { id: user.id } });

          let image = '/img/logos/small/user.png';
          if (user.gravatar) {
            image = gravatar.url(user.email, { s: 25, r: 'g', d: 'mm' }, { protocol: 'https' });
          } else if (user.image !== 'default') {
            image = '/img/users/' + user.image;
          }

          //Create session
          req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            image,
            change_password: user.date_password,
            starters_tour_ended: user.starters_tour_ended,
            extra: user_extra
          };
          // If user is admin add parameter to session
          if (user.admin) {
            req.session.user.admin = user.admin;
          }

          res.redirect('/idm');
        }
      } else {
        res.locals.message = {
          text: 'Error disabling two factor authentication',
          type: 'danger'
        };
        res.render('index', { errors: [], csrf_token: req.csrfToken() });
      }
    })
    .catch(function (error) {
      next(error);
    });
};

// POST /auth/tfa -- Verify token
exports.tfa_verify = function (req, res) {
  debug('--> verify token');
  // const flag = req.body.login_security_question;
  const user_token = req.body.token;
  // const user_question = req.body.security_question;
  // const user_answer = req.body.security_answer;
  // const data_url = req.body.qr;
  const remember_device = req.body.remember_device;

  // const verified_answer = false;
  // const verified_question = false;
  const errors = [];

  //Check if the token is valid
  models.user
    .findOne({
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
        'extra'
      ],
      where: {
        id: req.body.user_id
      }
    })
    .then(function (user) {
      //Verify the token
      const verified_token = Speakeasy.totp.verify({
        secret: user.extra.tfa.secret,
        encoding: 'base32',
        token: user_token,
        window: 0
      });

      //If user is trying to log in with security question
      if (verified_token) {
        // Create req.session.user and save id and username
        // The session is defined by the existence of: req.session.user
        let image = '/img/logos/small/user.png';
        if (user.gravatar) {
          image = gravatar.url(user.email, { s: 25, r: 'g', d: 'mm' }, { protocol: 'https' });
        } else if (user.image !== 'default') {
          image = '/img/users/' + user.image;
        }
        const user_extra = user.extra;
        if (remember_device) {
          debug('--> store familiar device');
          //Store device
          const user_agent = req.headers['user-agent'];
          const user_agent_array = user_extra.tfa.user_agent ? user_extra.tfa.user_agent : [];
          user_agent_array.push(user_agent);
          user_extra.tfa.user_agent = user_agent_array;
          models.user.update(
            {
              extra: user_extra
            },
            {
              where: { id: user.id }
            }
          );
        }
        //Create session
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          image,
          change_password: user.date_password,
          starters_tour_ended: user.starters_tour_ended,
          extra: user_extra
        };
        // If user is admin add parameter to session
        if (user.admin) {
          req.session.user.admin = user.admin;
        }
        res.redirect('/idm');
      } else {
        errors.push('wrong_token');
        debug('wrong_token');
        res.render('auth/tfa', {
          errors,
          user,
          csrf_token: req.csrfToken()
        });
      }
    });
};

// GET /update_password -- Render settings/password view with a warn to indicate user to change password
exports.update_password = function (req, res) {
  res.render('settings/change_password', {
    errors: [],
    warn_change_password: true,
    csrf_token: req.csrfToken()
  });
};

// DELETE /auth/logout -- Delete Session
exports.destroy = function (req, res) {
  debug('--> destroy');

  delete req.session.user;
  res.redirect('/');
};

// DELETE /auth/external_logout -- Delete Session from an external call
exports.external_destroy = function (req, res) {
  debug('--> external_destroy');

  const oauth_client_id = req.query.client_id;
  const url = req.hostname;

  models.oauth_client
    .findOne({
      where: {
        [Op.or]: [{ id: oauth_client_id }, { url }]
      },
      attributes: ['url', 'redirect_sign_out_uri']
    })
    .then(function (application) {
      if (application) {
        // If users have signed in through an OAuth Application, delete session.
        // If they have signed in through IdM Keyrock endpoint, just redirect to sign out endpoint.
        if (req.session.user) {
          if (req.session.user.oauth_sign_in) {
            delete req.session.user;
          }
        }

        if (application.redirect_sign_out_uri) {
          res.redirect(application.redirect_sign_out_uri);
        } else {
          res.redirect(application.url);
        }
      } else {
        res.status(401).json('Not allowed to perform logout or bad configured');
      }
    })
    .catch(function (error) {
      debug('Error: ' + error);
      res.status(500).json('Internal Server Error');
    });
};

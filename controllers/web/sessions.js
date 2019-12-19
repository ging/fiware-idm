const gravatar = require('gravatar');
const debug = require('debug')('idm:web-session_controller');

const models = require('../../models/models.js');
const user_controller = require('./users');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const Speakeasy = require('speakeasy');
const Qrcode = require('qrcode');

const escape_paths = require('../../etc/escape_paths/paths.json').paths;

// MW to authorized restricted http accesses
exports.login_required = function(req, res, next) {
  debug('--> login_required');

  if (req.session.user || check_path(req.path)) {
    next();
  } else {
    req.session.errors = [{ message: 'sessionExpired' }];
    res.redirect('/auth/login');
  }
};

// MW to perform actions forgot password and re send confirmation of registration
exports.login_not_required = function(req, res, next) {
  debug('--> login_not_required');
  if (req.session.user) {
    res.redirect('/');
  } else {
    next();
  }
};

// MW to see if user needs to change password
exports.password_check_date = function(req, res, next) {
  debug('--> password_check_date');

  if (check_path(req.path)) {
    next();
  } else {
    const today = new Date(new Date().getTime());
    const milli_seconds_per_day = 24 * 60 * 60 * 1000;

    const days_since_change = Math.round(
      (today - req.session.user.change_password) / milli_seconds_per_day
    );

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
exports.new = function(req, res) {
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
exports.create = function(req, res) {
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
    user_controller.authenticate(req.body.email, req.body.password, function(
      error,
      user
    ) {
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
        image = gravatar.url(
          user.email,
          { s: 25, r: 'g', d: 'mm' },
          { protocol: 'https' }
        );
      } else if (user.image !== 'default') {
        image = '/img/users/' + user.image;
      }

      if (user.extra && user.extra.tfa && user.extra.tfa.enabled) {
        debug('--> two factor authentication enabled');

        const user_agent = req.headers['user-agent'];

        if (
          user.extra.tfa.user_agent != null &&
          user.extra.tfa.user_agent.includes(user_agent)
        ) {
          debug('-->familiar device');
          req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            image,
            change_password: user.date_password,
            starters_tour_ended: user.starters_tour_ended,
            extra: user.extra,
          };
          // If user is admin add parameter to session
          if (user.admin) {
            req.session.user.admin = user.admin;
          }
          res.redirect('/idm');
        } else {
          const secret = user.extra.tfa.secret;
          debug('Loaded stored secret');
          debug(secret);
          const url = Speakeasy.otpauthURL({
            secret,
            label: user.username,
            issuer: 'IdM',
            encoding: 'base32',
          });
          //QR code module to generate a QR code that stores the data in secret.otpauth_url,
          //and then display the QR code to the user. This generates a PNG data URL.
          Qrcode.toDataURL(url, function(err, data_url) {
            return res.render('auth/tfa', {
              user,
              errors,
              secret,
              qr: data_url,
              csrf_token: req.csrfToken(),
            });
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
          extra: user.extra,
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

// GET /update_password -- Render settings/password view with a warn to indicate user to change password
exports.security_question = function(req, res) {
  debug(req.body.user_id);
  //If the token is valid
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
        'extra',
      ],
      where: {
        id: req.body.user_id,
      },
    })
    .then(function(user) {
      debug(user);
      res.render('auth/security_question', {
        errors: [],
        user,
        csrf_token: req.body.csrf_token,
      });
    });
};

// POST /auth/tfa -- Verify token
exports.tfa_verify = function(req, res) {
  debug('--> verify token');
  const flag = req.body.login_security_question;
  const user_token = req.body.token;
  const user_question = req.body.security_question;
  const user_answer = req.body.security_answer;
  const temp_secret = req.body.secret;
  const data_url = req.body.qr;
  const remember_device = req.body.remember_device;

  //Verify the token
  const verified_token = Speakeasy.totp.verify({
    secret: temp_secret,
    encoding: 'base32',
    token: user_token,
    window: 0,
  });
  let verified_answer = false;
  let verified_question = false;
  const errors = [];

  //Check if the token is valid
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
        'extra',
      ],
      where: {
        id: req.body.user_id,
      },
    })
    .then(function(user) {
      //If user is trying to log in with security question
      if (flag) {
        if (user_question === user.extra.tfa.question) {
          verified_question = true;
        } else {
          errors.push('wrong_question');
        }
        if (user_answer === user.extra.tfa.answer) {
          verified_answer = true;
        } else {
          errors.push('wrong_answer');
        }
        if (verified_answer && verified_question) {
          // Create req.session.user and save id and username
          // The session is defined by the existence of: req.session.user
          let image = '/img/logos/small/user.png';
          if (user.gravatar) {
            image = gravatar.url(
              user.email,
              { s: 25, r: 'g', d: 'mm' },
              { protocol: 'https' }
            );
          } else if (user.image !== 'default') {
            image = '/img/users/' + user.image;
          }
          //Store device
          const user_extra = user.extra;
          const user_agent = req.headers['user-agent'];
          user_extra.tfa.user_agent = user_agent;

          //Disable tfa
          user_extra.tfa.enabled = false;
          models.user.update({ extra: user_extra }, { where: { id: user.id } });
          //Create session
          req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            image,
            change_password: user.date_password,
            starters_tour_ended: user.starters_tour_ended,
            extra: user_extra,
          };
          // If user is admin add parameter to session
          if (user.admin) {
            req.session.user.admin = user.admin;
          }

          res.redirect('/idm');
        } else {
          res.render('auth/security_question', {
            errors,
            user,
            csrf_token: req.body.csrf_token,
          });
        }
        //If user is trying to log in with token
      } else if (verified_token) {
        // Create req.session.user and save id and username
        // The session is defined by the existence of: req.session.user
        let image = '/img/logos/small/user.png';
        if (user.gravatar) {
          image = gravatar.url(
            user.email,
            { s: 25, r: 'g', d: 'mm' },
            { protocol: 'https' }
          );
        } else if (user.image !== 'default') {
          image = '/img/users/' + user.image;
        }
        const user_extra = user.extra;
        if (remember_device) {
          debug('--> store familiar device');
          //Store device
          const user_agent = req.headers['user-agent'];
          const user_agent_array = user_extra.tfa.user_agent
            ? user_extra.tfa.user_agent
            : [];
          user_agent_array.push(user_agent);
          user_extra.tfa.user_agent = user_agent_array;
          models.user.update(
            {
              extra: user_extra,
            },
            {
              where: { id: user.id },
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
          extra: user_extra,
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
          csrf_token: req.body.csrf_token,
          secret: user.extra.tfa.secret,
          qr: data_url,
        });
      }

      // if (verified_token || (verified_answer && verified_question)) {
      //   // Create req.session.user and save id and username
      //   // The session is defined by the existence of: req.session.user
      //   let image = '/img/logos/small/user.png';
      //   if (user.gravatar) {
      //     image = gravatar.url(
      //       user.email,
      //       { s: 25, r: 'g', d: 'mm' },
      //       { protocol: 'https' }
      //     );
      //   } else if (user.image !== 'default') {
      //     image = '/img/users/' + user.image;
      //   }
      //   //Store device
      //   const user_extra = user.extra;
      //   const user_agent = req.headers['user-agent'];
      //   user_extra.tfa.user_agent = user_agent;
      //   models.user.update(
      //     {
      //       extra: user_extra,
      //     },
      //     {
      //       where: { id: user.id },
      //     }
      //   );
      //   //Create session
      //   req.session.user = {
      //     id: user.id,
      //     username: user.username,
      //     email: user.email,
      //     image,
      //     change_password: user.date_password,
      //     starters_tour_ended: user.starters_tour_ended,
      //     extra: user_extra,
      //   };
      //   // If user is admin add parameter to session
      //   if (user.admin) {
      //     req.session.user.admin = user.admin;
      //   }
      //
      //   res.redirect('/idm');
      // } else {
      //
      //   if (!verified_token){
      //
      //
      //   }
      // }
    });
};

// GET /update_password -- Render settings/password view with a warn to indicate user to change password
exports.update_password = function(req, res) {
  res.render('settings/change_password', {
    errors: [],
    warn_change_password: true,
    csrf_token: req.csrfToken(),
  });
};

// DELETE /auth/logout -- Delete Session
exports.destroy = function(req, res) {
  debug('--> destroy');

  delete req.session.user;
  res.redirect('/');
};

// DELETE /auth/external_logout -- Delete Session from an external call
exports.external_destroy = function(req, res) {
  debug('--> external_destroy');

  const oauth_client_id = req.query.client_id;
  const url = req.hostname;

  models.oauth_client
    .findOne({
      where: {
        [Op.or]: [{ id: oauth_client_id }, { url }],
      },
      attributes: ['url', 'redirect_sign_out_uri'],
    })
    .then(function(application) {
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
    .catch(function(error) {
      debug('Error: ' + error);
      res.status(500).json('Internal Server Error');
    });
};

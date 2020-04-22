const models = require('../../models/models.js');
const config = require('../../config');
const gravatar = require('gravatar');
const util = require('util');

const debug = require('debug')('idm:web-user_controller');

const email = require('../../lib/email.js');

// Create new user by email & username in SAML profile
function create_user_from_saml(req, res, callback) {
  debug('--> create user from saml');

  if (!(typeof req.user.email !== 'undefined' && req.user.email)) {
    debug('---> SAML Profile: email must not empty');
    req.session.errors = [{ message: 'invalid' }];
    return res.redirect('/auth/login');
  }

  if (!(typeof req.user.username !== 'undefined' && req.user.username)) {
    debug('---> SAML Profile: username must not empty');
    req.session.errors = [{ message: 'invalid' }];
    return res.redirect('/auth/login');
  }

  // Build a row and validate it
  const user = models.user.build({
    username: req.user.username,
    email: req.user.email,
    password: 'test',
    date_password: new Date(new Date().getTime()),
    enabled: true,
  });

  user
    .validate()
    .then(function() {
      debug('---> user is valid');
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
          .then(function() {
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
            callback(req, res);
          });
      });
    })
    .catch(function(error) {
      // print the error details
      debug('users is invalid: ' + error);
      req.session.errors = [{ message: 'invalid' }];
      res.redirect('/auth/login');
    });
  return undefined;
}

function find_or_create_user_from_saml(req, res) {
  debug('--> find_or_create_user_from_saml');
  debug(
    '--> SAML Prifole: ' +
      util.inspect(req.user, { showHidden: false, depth: null }) // eslint-disable-line snakecase/snakecase
  );

  if (!(typeof req.user.email !== 'undefined' && req.user.email)) {
    debug('---> SAML Profile: email must not empty');
    req.session.errors = [{ message: 'invalid' }];
    return res.redirect('/auth/login');
  }

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
        email: req.user.email,
      },
    })
    .then(function(user) {
      if (user) {
        if (user.enabled === false) {
          debug('---> user is disabled');
          req.session.errors = [{ message: 'user_not_found' }];
          return res.redirect('/auth/login');
        }

        // Create req.session.user and save id and username
        // The session is defined by the existence of: req.session.user

        let image = '/img/logos/small/user.png';

        if (user.gravatar) {
          image = gravatar.url(
            user.email,
            { s: 100, r: 'g', d: 'mm' },
            { protocol: 'https' }
          );
        } else if (user.image === 'default') {
          image = '/img/logos/original/user.png';
        } else {
          image = '/img/users/' + user.image;
        }

        // Create session
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          image,
          change_password: user.date_password,
          starters_tour_ended: user.starters_tour_ended,
        };

        // If user is admin add parameter to session
        if (user.admin) {
          req.session.user.admin = user.admin;
        }

        res.redirect('/idm');
      } else {
        debug('---> user not found & create new user');
        create_user_from_saml(req, res, find_or_create_user_from_saml);
      }
      return undefined;
    })
    .catch(function(error) {
      debug('---> user is not found: ' + error);
      req.session.errors = [{ message: 'user_not_found' }];
      res.redirect('/auth/login');
    });
  return undefined;
}

exports.load_user_by_email = function(req, res) {
  find_or_create_user_from_saml(req, res);
};

const models = require('../models/models.js');
const config_service = require('../lib/configService.js');
const config = config_service.get_config();
const external_auth = config.external_auth;

const debug = require('debug')('idm:external_auth');

// MW to see if user is registered
exports.authenticate = function (username, password, callback) {
  debug('--> authenticating external user');
  // Search the user
  models.user_ext
    .find({
      attributes: ['id', 'username', 'email', 'password', 'password_salt'],
      where: {
        email: username
      }
    })
    .then(function (user) {
      debug('--> user found', user.username);
      if (user) {
        // Verify password
        if (user.verifyPassword(password)) {
          find_local_user(user, function (local_user) {
            callback(null, local_user);
          });
        } else {
          callback(new Error('invalid'));
        }
      } else {
        callback(new Error('user_not_found'));
      }
    })
    .catch(function (error) {
      callback(error);
    });
};

function find_local_user(user, callback) {
  debug('--> searching local user with id: ', external_auth.id_prefix + user.id);
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
        'starters_tour_ended'
      ],
      where: {
        id: external_auth.id_prefix + user.id
      }
    })
    .then(function (local_user) {
      if (local_user) {
        debug('--> local user already exists', local_user);
        callback(local_user);
      } else {
        debug('--> local user does not exist, creating it');
        create_local_user(user, function (local_user) {
          debug('--> local user created');
          callback(local_user);
        });
      }
    })
    .catch(function (error) {
      callback(error);
    });
}

function create_local_user(user, callback) {
  debug('--> creating local user');

  // TODO: update user values if changed in external database

  // Build a row and validate it
  const local_user = models.user.build({
    id: external_auth.id_prefix + user.id,
    username: user.username,
    email: user.email,
    password: 'none',
    date_password: new Date(new Date().getTime()),
    enabled: true
  });

  local_user
    .validate()
    .then(function () {
      // Save the row in the database
      local_user.save().then(function () {
        callback(local_user);
      });
      // If validation fails, send an array with all errors found
    })
    .catch(function (error) {
      debug('--> error creating local user', error);
      callback(error);
    });
}

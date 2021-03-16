const debug = require('debug')('idm:api-users');
const models = require('../../models/models.js');
const diff_object = require('../../lib/object_functions.js').diff_object;
const uuid = require('uuid');

const config_service = require('../../lib/configService.js');
const config = config_service.get_config();
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const external_auth = config.external_auth;
const external_auth_ldap = config.external_auth_ldap;

const email_list = config.email_list_type
  ? fs
      .readFileSync(path.join(__dirname, '../../etc/email_list/' + config.email_list_type + '.txt'))
      .toString('utf-8')
      .split('\n')
  : [];

// MW to see if user is registered
let authentication_driver;

if (external_auth.enabled) {
  authentication_driver = require('../../external_auth/authentication_driver').authenticate;
} else if (external_auth_ldap.enabled) {
  authentication_driver = require('../../external_auth/authentication_driver_ldap').authenticate;
} else {
  authentication_driver = function (username, password, callback) {
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
          'starters_tour_ended'
        ],
        where: {
          email: username
        }
      })
      .then(function (user) {
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
      .catch(function (error) {
        callback(error);
      });
  };
}

exports.authenticate = authentication_driver;

// MW to Autoload info if path include user_id
exports.load_user = function (req, res, next, user_id) {
  debug('--> load_user');

  models.user
    .findOne({
      where: { id: user_id },
      attributes: [
        'id',
        'username',
        'email',
        'enabled',
        'admin',
        'image',
        'gravatar',
        'date_password',
        'description',
        'website'
      ]
    })
    .then(function (user) {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(404).json({
          error: { message: 'User not found', code: 404, title: 'Not Found' }
        });
      }
    })
    .catch(function (error) {
      debug('Error: ' + error);
      if (!error.error) {
        error = {
          error: {
            message: 'Internal error',
            code: 500,
            title: 'Internal error'
          }
        };
      }
      res.status(error.error.code).json(error);
    });
};

// MW to check if user is admin
exports.check_admin = function (req, res, next) {
  if (req.token_owner.admin) {
    next();
  } else {
    res.status(403).json({
      error: {
        message: 'User not authorized to perform action',
        code: 403,
        title: 'Forbidden'
      }
    });
  }
};

// MW to check if user in url is the same as token owner
exports.check_user = function (req, res, next) {
  if (req.token_owner.id === req.user.id || req.token_owner.admin) {
    next();
  } else {
    res.status(403).json({
      error: {
        message: 'User not authorized to perform action',
        code: 403,
        title: 'Forbidden'
      }
    });
  }
};

// GET /v1/users -- Send index of users
exports.index = function (req, res) {
  debug('--> index');

  models.user
    .findAll({
      attributes: ['id', 'username', 'email', 'enabled', 'gravatar', 'date_password', 'description', 'website']
    })
    .then(function (users) {
      if (users.length > 0) {
        users = _.map(users, (user) => {
          user.urls = {
            organization_roles_url: '/v1/users/' + user.id + '/organization_roles',
            roles_url: '/v1/users/' + user.id + '/roles'
          };
          return user;
        });
        res.status(200).json({ users });
      } else {
        res.status(404).json({
          error: {
            message: 'Users not found',
            code: 404,
            title: 'Not Found'
          }
        });
      }
    })
    .catch(function (error) {
      debug('Error: ' + error);
      if (!error.error) {
        error = {
          error: {
            message: 'Internal error',
            code: 500,
            title: 'Internal error'
          }
        };
      }
      res.status(error.error.code).json(error);
    });
};

// POST /v1/users -- Create user
exports.create = function (req, res) {
  debug('--> create');

  check_create_body_request(req.body)
    .then(function () {
      const user = models.user.build(req.body.user);

      user.image = 'default';
      user.enabled = true;
      user.id = uuid.v4();
      user.date_password = new Date(new Date().getTime());
      return user.validate();
    })
    .then(function (user) {
      return user.save({
        fields: [
          'id',
          'username',
          'description',
          'website',
          'gravatar',
          'email',
          'password',
          'date_password',
          'extra',
          'enabled',
          'salt'
        ]
      });
    })
    .then(function (user) {
      const user_response = user.dataValues;
      delete user_response.password;
      res.status(201).json({ user: user_response });
    })
    .catch(function (error) {
      debug('Error: ' + error);
      if (!error.error) {
        if (error.errors[0].message === 'emailUsed') {
          error = {
            error: {
              message: 'Email already used',
              code: 409,
              title: 'Conflict'
            }
          };
        } else if (error.errors[0].message === 'email') {
          error = {
            error: {
              message: 'Email not valid',
              code: 400,
              title: 'Bad Request'
            }
          };
        } else {
          error = {
            error: {
              message: 'Internal error',
              code: 500,
              title: 'Internal error'
            }
          };
        }
      }
      res.status(error.error.code).json(error);
    });
};

// GET /v1/users/:user_id -- Get info about user
exports.info = function (req, res) {
  debug('--> info');
  const user = req.user;
  user.urls = {
    organization_roles_url: '/v1/users/' + user.id + '/organization_roles',
    roles_url: '/v1/users/' + user.id + '/roles'
  };
  res.status(200).json({ user });
};

// PUT /v1/users/:user_id -- Edit user
exports.update = function (req, res) {
  debug('--> update');

  let user_previous_values = null;
  check_update_body_request(req.body)
    .then(function () {
      user_previous_values = JSON.parse(JSON.stringify(req.user.dataValues));

      req.user.username = req.body.user.username ? req.body.user.username : req.user.username;
      req.user.email = req.body.user.email ? req.body.user.email : req.user.email;
      req.user.description = req.body.user.description ? req.body.user.description : req.user.description;
      req.user.website = req.body.user.website ? req.body.user.website : req.user.website;
      req.user.gravatar = req.body.user.gravatar ? req.body.user.gravatar : req.user.gravatar;
      req.user.extra = req.body.user.extra ? req.body.user.extra : req.user.extra;
      req.user.enabled = true;
      if (req.body.user.password) {
        req.user.password = req.body.user.password;
        req.user.date_password = new Date(new Date().getTime());
      }

      return req.user.validate();
    })
    .then(function () {
      return req.user.save();
    })
    .then(function () {
      const difference = diff_object(user_previous_values, req.user.dataValues);
      const response =
        Object.keys(difference).length > 0
          ? { values_updated: difference }
          : {
              message: "Request don't change the user parameters",
              code: 200,
              title: 'OK'
            };
      delete response.values_updated.password;
      delete response.values_updated.date_password;
      res.status(200).json(response);
    })
    .catch(function (error) {
      debug('Error: ' + error);
      if (!error.error) {
        if (error.errors[0].message === 'emailUsed') {
          error = {
            error: {
              message: 'Email already used',
              code: 409,
              title: 'Conflict'
            }
          };
        } else if (error.errors[0].message === 'email') {
          error = {
            error: {
              message: 'Email not valid',
              code: 400,
              title: 'Bad Request'
            }
          };
        } else {
          error = {
            error: {
              message: 'Internal error',
              code: 500,
              title: 'Internal error'
            }
          };
        }
      }
      res.status(error.error.code).json(error);
    });
};

// DELETE /v1/users/:user_id -- Delete user
exports.delete = function (req, res) {
  debug('--> delete');

  models.user
    .destroy({
      where: { id: req.user.id }
    })
    .then(function (destroyed) {
      if (destroyed) {
        return res.status(204).json('User ' + req.user.id + ' destroyed');
      }
      return Promise.reject({
        error: { message: 'User not found', code: 404, title: 'Bad Request' }
      });
    })
    .catch(function (error) {
      debug('Error: ' + error);
      if (!error.error) {
        error = {
          error: {
            message: 'Internal error',
            code: 500,
            title: 'Internal error'
          }
        };
      }
      res.status(error.error.code).json(error);
    });
};

// Check body in create request
function check_create_body_request(body) {
  return new Promise(function (resolve, reject) {
    if (!body.user) {
      reject({
        error: {
          message: 'Missing parameter user in body request',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (!body.user.username) {
      reject({
        error: {
          message: 'Missing parameter username in body request or empty username',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (!body.user.password) {
      reject({
        error: {
          message: 'Missing parameter password in body request or empty password',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (!body.user.email) {
      reject({
        error: {
          message: 'Missing parameter email in body request or empty email',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (config.email_list_type && body.user.email) {
      if (config.email_list_type === 'whitelist' && !email_list.includes(body.user.email.split('@')[1])) {
        reject({
          error: { message: 'Invalid email', code: 400, title: 'Bad Request' }
        });
      }

      if (config.email_list_type === 'blacklist' && email_list.includes(body.user.email.split('@')[1])) {
        reject({
          error: { message: 'Invalid email', code: 400, title: 'Bad Request' }
        });
      }

      resolve();
    } else {
      resolve();
    }
  });
}

// Check body in update request
function check_update_body_request(body) {
  return new Promise(function (resolve, reject) {
    if (!body.user) {
      reject({
        error: {
          message: 'Missing parameter user in body request',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (body.user.id) {
      reject({
        error: { message: 'Cannot set id', code: 400, title: 'Bad Request' }
      });
    } else if (body.user.username && body.user.username.length === 0) {
      reject({
        error: {
          message: 'Cannot set empty username',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (body.user.email && body.user.email.length === 0) {
      reject({
        error: {
          message: 'Cannot set empty email',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (body.user.password && body.user.password.length <= 0) {
      reject({
        error: {
          message: 'Cannot set empty password',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (config.email_list_type && body.user.email) {
      if (config.email_list_type === 'whitelist' && !email_list.includes(body.user.email.split('@')[1])) {
        reject({
          error: { message: 'Invalid email', code: 400, title: 'Bad Request' }
        });
      }

      if (config.email_list_type === 'blacklist' && email_list.includes(body.user.email.split('@')[1])) {
        reject({
          error: { message: 'Invalid email', code: 400, title: 'Bad Request' }
        });
      }

      resolve();
    } else {
      resolve();
    }
  });
}

const models = require('../../models/models.js');

const config_service = require('../../lib/configService.js');
const config_authzforce = config_service.get_config().authzforce;
const debug = require('debug')('idm:api-authenticate_oauth');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Middleware to load oauth2 token info
exports.load_oauth = function (req, res, next, oauth_token_id) {
  if (!oauth_token_id) {
    res.status(400).json({
      error: {
        message: 'Expecting to find Oauth Token in url',
        code: 400,
        title: 'Bad Request'
      }
    });
  } else {
    // eslint-disable-next-line snakecase/snakecase
    const subject_token = decodeURIComponent(oauth_token_id);

    // Search info of oauth token and include pep proxy
    search_oauth2_token(subject_token)
      .then(function (oauth2_token_owner) {
        req.oauth2_token_owner = oauth2_token_owner;
        next();
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
        next(error);
      });
  }
};

// Middlware to check request
exports.check_request = function (req, res, next) {
  if (!req.headers['x-auth-token']) {
    res.status(400).json({
      error: {
        message: 'Expecting to find X-Auth-token in requests',
        code: 400,
        title: 'Bad Request'
      }
    });
  } else {
    const auth_token = req.headers['x-auth-token'];

    // Search info of auth token and include pep proxy
    search_auth_token(auth_token)
      .then(function (auth_token_owner) {
        req.auth_token_owner = auth_token_owner;
        next();
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
  }
};

// GET /access-tokens/:oauth_token -- Get info from a token
exports.info_token = function (req, res) {
  debug(' --> info_token');

  const app_id = req.oauth2_token_owner.oauth_client_id;

  // Search for roles of iot agents
  if (req.oauth2_token_owner.iot) {
    // ... search for roles of iots
    const iot_info = {
      organizations: [],
      displayName: '', //eslint-disable-line snakecase/snakecase
      roles: [],
      app_id,
      isGravatarEnabled: false, //eslint-disable-line snakecase/snakecase
      email: '',
      id: req.oauth2_token_owner.iot,
      app_azf_domain: ''
    };
    res.status(200).json(iot_info);
  } else if (req.oauth2_token_owner.user) {
    const user = req.oauth2_token_owner.user;
    // Search roles of user in application
    search_user_info(user, app_id)
      .then(function (user_info) {
        res.status(200).json(user_info);
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
  } else {
    const user_info = {
      organizations: [],
      displayName: '', //eslint-disable-line snakecase/snakecase
      roles: [],
      app_id,
      isGravatarEnabled: false, //eslint-disable-line snakecase/snakecase
      email: '',
      id: '',
      app_azf_domain: ''
    };
    res.status(200).json(user_info);
  }
};

// Function to search token in database
function search_auth_token(token_id) {
  return models.auth_token
    .findOne({
      where: { access_token: token_id },
      include: [
        {
          model: models.pep_proxy,
          attributes: ['id', 'oauth_client_id']
        },
        {
          model: models.user,
          attributes: ['id', 'username', 'email', 'image', 'gravatar']
        }
      ]
    })
    .then(function (token_info) {
      if (token_info) {
        if (new Date().getTime() > token_info.expires.getTime()) {
          return Promise.reject({
            error: {
              message: 'Auth token has expired',
              code: 401,
              title: 'Unauthorized'
            }
          });
        }

        const auth_token_owner = token_info.User ? token_info.User : token_info.PepProxy;

        return Promise.resolve(auth_token_owner);
      }
      return Promise.reject({
        error: {
          message: 'Auth token not found',
          code: 404,
          title: 'Not Found'
        }
      });
    });
}

// Function to search oauth2 token in database
function search_oauth2_token(token_id) {
  return models.oauth_access_token
    .findOne({
      where: { access_token: token_id },
      include: [
        {
          model: models.user,
          attributes: ['id', 'username', 'email', 'gravatar']
        }
      ]
    })
    .then(function (token_info) {
      if (token_info) {
        if (new Date().getTime() > token_info.expires.getTime()) {
          return Promise.reject({
            error: {
              message: 'Oauth token has expired',
              code: 401,
              title: 'Unauthorized'
            }
          });
        }

        const oauth2_token_owner = {
          oauth_client_id: token_info.oauth_client_id
        };

        if (token_info.user_id) {
          oauth2_token_owner.user = token_info.User;
        }

        if (token_info.iot_id) {
          oauth2_token_owner.iot = token_info.iot_id;
        }

        return Promise.resolve(oauth2_token_owner);
      }
      return Promise.reject({
        error: {
          message: 'Oauth token not found',
          code: 404,
          title: 'Not Found'
        }
      });
    });
}

function search_user_info(user, app_id) {
  // Search organizations in wich user is member or owner
  const search_organizations = models.user_organization.findAll({
    where: { user_id: user.id },
    include: [
      {
        model: models.organization,
        attributes: ['id']
      }
    ]
  });
  // Search roles for user or the organization to which the user belongs
  const search_roles = search_organizations.then(function (organizations) {
    const search_role_organizations = [];
    if (organizations.length > 0) {
      for (let i = 0; i < organizations.length; i++) {
        search_role_organizations.push({
          organization_id: organizations[i].organization_id,
          role_organization: organizations[i].role
        });
      }
    }
    return models.role_assignment.findAll({
      where: {
        [Op.or]: [{ [Op.or]: search_role_organizations }, { user_id: user.id }],
        oauth_client_id: app_id
      },
      include: [
        {
          model: models.user,
          attributes: ['id', 'username', 'email', 'gravatar']
        },
        {
          model: models.role,
          attributes: ['id', 'name']
        },
        {
          model: models.organization,
          attributes: ['id', 'name', 'description', 'website']
        }
      ]
    });
  });

  let search_authzforce = new Promise((resolve) => {
    resolve();
  });
  if (config_authzforce) {
    search_authzforce = models.authzforce.findOne({
      where: { oauth_client_id: app_id }
    });
  }

  return Promise.all([search_organizations, search_roles, search_authzforce]).then(function (values) {
    const role_assignment = values[1];

    if (role_assignment.length <= 0) {
      return Promise.reject({
        error: {
          message: 'User is not authorized',
          code: 401,
          title: 'Unauthorized'
        }
      });
    }
    const user_info = {
      organizations: [],
      displayName: user.username, //eslint-disable-line snakecase/snakecase
      roles: [],
      app_id,
      isGravatarEnabled: user.gravatar, //eslint-disable-line snakecase/snakecase
      email: user.email,
      id: user.id,
      app_azf_domain: config_authzforce && values[2] ? values[2].az_domain : ''
    };

    for (let i = 0; i < role_assignment.length; i++) {
      const role = role_assignment[i].Role.dataValues;

      if (!['provider', 'purchaser'].includes(role.id)) {
        if (role_assignment[i].Organization) {
          const organization = role_assignment[i].Organization.dataValues;
          const index = user_info.organizations
            .map(function (e) {
              return e.id;
            })
            .indexOf(organization.id);

          if (index < 0) {
            organization.roles = [role];
            user_info.organizations.push(organization);
          } else {
            user_info.organizations[index].roles.push(role);
          }
        }

        if (role_assignment[i].User) {
          user_info.roles.push(role);
        }
      }
    }

    return Promise.resolve(user_info);
  });
}

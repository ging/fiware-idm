const models = require('../../models/models.js');
const fs = require('fs');
const _ = require('lodash');

const config_service = require('../../lib/configService.js');
const config = config_service.get_config();
const config_usage_control = config.usage_control;

const debug = require('debug')('idm:web-application_controller');
const gravatar = require('gravatar');

const image = require('../../lib/image.js');
const crypto = require('crypto');

// Autoload info if path include application_id
exports.load_application = function (req, res, next, application_id) {
  debug('--> load_application');

  if (application_id === 'idm_admin_app') {
    // Reponse with message
    const response = { text: ' Application doesn`t exist.', type: 'danger' };

    // Send response depends on the type of request
    send_response(req, res, response, '/idm/applications');
  } else {
    // Search application whose id is application_id
    models.oauth_client
      .findById(application_id)
      .then(function (application) {
        // If application exists, set image from file system
        if (application) {
          req.application = application;
          if (application.image === 'default') {
            req.application.image = '/img/logos/original/app.png';
          } else {
            req.application.image = '/img/applications/' + application.image;
          }
          // Send request to next function
          next();
        } else {
          // Reponse with message
          const err = new Error('Not Found');
          err.status = 404;
          res.locals.error = err;
          res.render('errors/not_found');
        }
      })
      .catch(next);
  }
};

// GET /idm/applications -- List all applications
exports.index = function (req, res, next) {
  debug('--> index');

  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }

  models.user_organization
    .findAll({
      where: { user_id: req.session.user.id },
      include: [
        {
          model: models.organization,
          attributes: ['id', 'name']
        }
      ]
    })
    .then(function (organizations) {
      res.render('applications/index', {
        organizations,
        csrf_token: req.csrfToken()
      });
    })
    .catch(next);
};

// GET /idm/applications/filtered_user -- Filter applications of user by page
exports.filter_user = function (req, res) {
  debug('--> filter_user');

  const offset = req.query.page ? (req.query.page - 1) * 5 : 0;
  models.helpers
    .search_distinct('role_assignment', 'oauth_client', req.session.user.id, 'user', '%%', offset, true, req.query.role)
    .then(function (user_applications) {
      let count = 0;
      // If user has applications, set image from file system and obtain info from each application
      if (user_applications.length > 0) {
        count = user_applications[0].count;
        user_applications.forEach(function (app) {
          if (app.image === 'default') {
            app.image = '/img/logos/medium/app.png';
          } else {
            app.image = '/img/applications/' + app.image;
          }
        });
      }

      res.send({ applications: user_applications, number_applications: count });
    })
    .catch(function (error) {
      debug('Error get users authorized: ' + error);
      const message = {
        text: ' Unable to find user applications',
        type: 'danger'
      };
      send_response(req, res, message, '/idm/applications');
    });
};

// GET /idm/applications/filtered_organization -- Filter applications of user organization by page
exports.filter_organization = function (req, res) {
  debug('--> filter_organization');

  const offset = req.query.page ? (req.query.page - 1) * 5 : 0;

  models.helpers
    .search_distinct(
      'role_assignment',
      'oauth_client',
      req.query.organization,
      'organization',
      '%%',
      offset,
      true,
      req.query.role
    )
    .then(function (org_applications) {
      let count = 0;
      // If user has applications, set image from file system and obtain info from each application
      if (org_applications.length > 0) {
        count = org_applications[0].count;
        org_applications.forEach(function (app) {
          if (app.image === 'default') {
            app.image = '/img/logos/medium/app.png';
          } else {
            app.image = '/img/applications/' + app.image;
          }
        });
      }

      res.send({ applications: org_applications, number_applications: count });
    })
    .catch(function (error) {
      debug('Error get users authorized: ' + error);
      const message = {
        text: ' Unable to find user applications',
        type: 'danger'
      };
      send_response(req, res, message, '/idm/applications');
    });
};

// GET /idm/applications/:application_id -- Show info about an application
exports.show = function (req, res) {
  debug('--> show');

  // Search iot sensors of application
  const search_iots = models.iot.findAll({
    where: { oauth_client_id: req.application.id },
    attributes: ['id']
  });

  // Search pep proxy of application
  const search_pep = models.pep_proxy.findOne({
    where: { oauth_client_id: req.application.id },
    attributes: ['id']
  });

  Promise.all([search_iots, search_pep])
    .then(function (values) {
      const iot_sensors = values[0];
      const pep_proxy = values[1];

      // Send message if error exists
      if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message;
      }

      res.render('applications/show', {
        application: req.application,
        user_logged_permissions: req.user_owned_permissions,
        pep_proxy,
        iot_sensors,
        eidas_enabled: config.eidas.enabled,
        eidas_credentials: req.eidas_credentials,
        gateway_host: config.eidas.gateway_host,
        data_usage_enabled: config.usage_control.enabled,
        errors: [],
        csrf_token: req.csrfToken()
      });
    })
    .catch(function (error) {
      debug('Error: ' + error);

      // Send an error if the the request is via AJAX or redirect if is via browser
      const response = { text: ' Error showing app info.', type: 'danger' };
      // Send response depends on the type of request
      send_response(req, res, response, '/idm/applications');
    });
};

// GET /idm/applications/:application_id/authorize_users -- Send authorizes users of an application
exports.authorized_users = function (req, res) {
  debug('--> authorized_users');

  const key = req.query.key ? '%' + req.query.key + '%' : '%%';
  const offset = req.query.page ? (req.query.page - 1) * 5 : 0;

  models.helpers
    .search_distinct('role_assignment', 'user', req.application.id, 'oauth_client', key, offset, true)
    .then(function (users_authorized) {
      const users = [];

      let count = 0;

      // If user has organizations, set image from file system and obtain info from each organization
      if (users_authorized.length > 0) {
        count = users_authorized[0].count;

        users_authorized.forEach(function (user) {
          if (user.gravatar) {
            user.image = gravatar.url(user.email, { s: 100, r: 'g', d: 'mm' }, { protocol: 'https' });
          } else if (user.image === 'default') {
            user.image = '/img/logos/medium/user.png';
          } else {
            user.image = '/img/users/' + user.image;
          }
          users.push({
            id: user.user_id,
            username: user.username,
            image: user.image
          });
        });
      }
      res.send({ users, users_number: count });
    })
    .catch(function (error) {
      debug('Error get users authorized: ' + error);
      const message = { text: ' Unable to find members', type: 'danger' };
      send_response(req, res, message, '/idm');
    });
};

// GET /idm/applications/:application_id/authorize_organizations -- Send authorizes organizations of an application
exports.authorized_organizations = function (req, res) {
  debug('--> authorized_organizations');

  const key = req.query.key ? '%' + req.query.key + '%' : '%%';
  const offset = req.query.page ? (req.query.page - 1) * 5 : 0;

  models.helpers
    .search_distinct('role_assignment', 'organization', req.application.id, 'oauth_client', key, offset, true)
    .then(function (organizations_authorized) {
      const organizations = [];

      let count = 0;

      // If user has organizations, set image from file system and obtain info from each organization
      if (organizations_authorized.length > 0) {
        count = organizations_authorized[0].count;

        organizations_authorized.forEach(function (organization) {
          if (organization.image === 'default') {
            organization.image = '/img/logos/medium/group.png';
          } else {
            organization.image = '/img/organizations/' + organization.image;
          }
          organizations.push({
            id: organization.organization_id,
            name: organization.name,
            image: organization.image,
            description: organization.description
          });
        });
      }
      res.send({ organizations, organizations_number: count });
    })
    .catch(function (error) {
      debug('Error get organizations authorized: ' + error);
      const message = { text: ' Unable to find organizations', type: 'danger' };
      send_response(req, res, message, '/idm');
    });
};

// GET /idm/applications/new -- Render a view to create a new application
exports.new = function (req, res, next) {
  debug('--> new');

  models.user_organization
    .findAll({
      where: { user_id: req.session.user.id, role: 'owner' },
      include: [
        {
          model: models.organization,
          attributes: ['id', 'name']
        }
      ]
    })
    .then(function (organizations) {
      res.render('applications/new', {
        application: {},
        organizations,
        errors: [],
        eidas_enabled: config.eidas.enabled,
        csrf_token: req.csrfToken()
      });
    })
    .catch(function (error) {
      next(error);
    });
};

// POST /idm/applications -- Create application
exports.create = function (req, res, next) {
  debug('--> create');

  const possible_grant_types = [
    'client_credentials',
    'password',
    'implicit',
    'authorization_code',
    'refresh_token',
    'hybrid'
  ];
  if (req.body.grant_type) {
    if (_.difference(req.body.grant_type, possible_grant_types).length > 0) {
      req.session.message = {
        text: ' Application creation failed.',
        type: 'danger'
      };
      return res.redirect('/idm/applications');
    }
  }
  if (req.body.id || req.body.secret) {
    req.session.message = {
      text: ' Application creation failed.',
      type: 'danger'
    };
    return res.redirect('/idm/applications');
  }

  // Build a row and validate if input values are correct (not empty) before saving values in oauth_client
  const application = models.oauth_client.build(req.body.application);
  application.grant_type = req.body.grant_type ? req.body.grant_type : [''];

  const response_type = [];
  if (application.grant_type.includes('authorization_code')) {
    response_type.push('code');
  }

  if (application.grant_type.includes('implicit')) {
    response_type.push('token');
  }

  if (req.body.openID) {
    response_type.push('id_token');
    application.token_types = ['jwt'];
    application.scope = ['openid'];
    application.jwt_secret = crypto.randomBytes(16).toString('hex').slice(0, 16);
    if (!req.body.grant_type.includes('hybrid')) {
      req.body.grant_type.push('hybrid');
    }
  }

  application.response_type = response_type;

  const validate = application.validate();
  const save = validate.then(function () {
    application.description.trim();
    return application.save({
      fields: [
        'id',
        'name',
        'description',
        'url',
        'redirect_uri',
        'redirect_sign_out_uri',
        'secret',
        'image',
        'grant_type',
        'scope',
        'response_type'
      ]
    });
  });

  let assign;

  // See if the user or the organization will be the provider of the application
  if (req.body.provider !== req.session.user.id) {
    // Check if user is owner of the organization send
    const organizations = models.user_organization.findOne({
      where: {
        user_id: req.session.user.id,
        organization_id: req.body.provider,
        role: 'owner'
      }
    });

    // Create row in db role_assignment if organization exists
    const create_row = organizations
      .then(function (row) {
        if (row) {
          return models.role_assignment.create({
            oauth_client_id: application.id,
            role_id: 'provider',
            organization_id: req.body.provider,
            role_organization: 'owner'
          });
        }
        return Promise.reject();
      })
      .catch(function (error) {
        debug('Error: ', error);
        return Promise.reject('no_organization');
      });

    // If application is save in oauth_client_id, create assignment in role_assignment db
    assign = save.then(function () {
      return create_row;
    });
  } else {
    // If application is save in oauth_client_id, create assignment in role_assignment db
    assign = save.then(function () {
      return models.role_assignment.create({
        oauth_client_id: application.id,
        role_id: 'provider',
        user_id: req.session.user.id
      });
    });
  }

  return Promise.all([save, assign])
    .then(function () {
      if (config.eidas && req.body.eidas === 'eidas') {
        res.redirect('/idm/applications/' + application.id + '/step/eidas');
      } else {
        res.redirect('/idm/applications/' + application.id + '/step/avatar');
      }
    })
    .catch(function (error) {
      debug('Error: ', error);
      if (error === 'no_organization') {
        // Destroy application with specific id
        models.oauth_client
          .destroy({
            where: { id: application.id }
          })
          .then(function () {
            // Send message of success in deleting application
            req.session.message = {
              text: " Can't create application.",
              type: 'danger'
            };
            res.redirect('/idm/applications');
          })
          .catch(function (error) {
            debug('Error: ', error);
            // Send message of fail when deleting application
            req.session.message = {
              text: ' Application create error.',
              type: 'warning'
            };
            res.redirect('/idm/applications');
          });
      } else {
        const name_errors = [];
        if (error.errors.length) {
          for (const i in error.errors) {
            name_errors.push(error.errors[i].message);
          }
        }
        models.user_organization
          .findAll({
            where: { user_id: req.session.user.id, role: 'owner' },
            include: [
              {
                model: models.organization,
                attributes: ['id', 'name']
              }
            ]
          })
          .then(function (organizations) {
            res.render('applications/new', {
              application,
              organizations,
              eidas_enabled: config.eidas.enabled,
              errors: name_errors,
              csrf_token: req.csrfToken()
            });
          })
          .catch(function (error) {
            next(error);
          });
      }
    });
};

// GET /idm/applications/:application_id/step/avatar -- Form to create avatar when creating an application
exports.step_new_avatar = function (req, res) {
  debug('--> step_new_avatar');

  res.render('applications/step_create_avatar', {
    application: req.application,
    errors: [],
    csrf_token: req.csrfToken()
  });
};

// POST /idm/applications/:application_id/step/avatar -- Create Avatar when creating an application
exports.step_create_avatar = function (req, res) {
  debug('--> step_create_avatar');

  // See if the user has selected a image to upload
  if (req.file) {
    handle_uploaded_images(req, res, '/idm/applications/' + req.application.id + '/step/roles');
    // If not, the default image is assigned to the application
  } else {
    req.application.image = '/img/logos/original/app.png';
    res.redirect('/idm/applications/' + req.application.id + '/step/roles');
  }
};

// GET /idm/applications/:application_id/step/roles -- Form to assign roles when creating an application
exports.step_new_roles = function (req, res) {
  debug('--> step_new_roles');

  res.render('applications/step_create_roles', {
    application: req.application,
    authorization_level: config.authorization.level,
    data_usage_enabled: config_usage_control.enabled,
    csrf_token: req.csrfToken()
  });
};

// GET /idm/applications/:application_id/edit -- View to edit application
exports.edit = function (req, res) {
  debug('--> edit');

  res.render('applications/edit', {
    application: req.application,
    errors: [],
    csrf_token: req.csrfToken()
  });
};

// PUT /idm/applications/:application_id/edit/avatar -- Update application avatar
exports.update_avatar = function (req, res) {
  debug('--> update_avatar');

  // See if the user has selected a image to upload
  if (req.file) {
    handle_uploaded_images(req, res, '/idm/applications/' + req.application.id);
    // If not redirect to show application info
  } else {
    req.session.message = { text: ' fail updating image.', type: 'warning' };
    res.redirect('/idm/applications/' + req.application.id);
  }
};

// PUT /idm/applications/:application_id/edit/info -- Update application information
exports.update_info = function (req, res) {
  debug('--> update_info');
  debug(req.body.application.grant_type);

  // If body has parameters id or secret don't update the application
  if (req.body.application.id || req.body.application.secret) {
    res.locals.message = { text: ' Application edit failed.', type: 'danger' };
    res.redirect('/idm/applications/' + req.application.id);
  } else {
    if (config.oauth2.unique_url) {
      if (req.application.url === req.body.application.url) {
        delete req.body.application.url;
      }
    }

    // Build a row and validate if input values are correct (not empty) before saving values in oauth_client table
    req.body.application.id = req.application.id;
    const application = models.oauth_client.build(req.body.application);
    application.grant_type = req.body.application.grant_type ? req.body.application.grant_type : [''];
    const response_type = [];
    if (application.grant_type.includes('authorization_code')) {
      response_type.push('code');
    }

    if (application.grant_type.includes('implicit')) {
      response_type.push('token');
    }

    if (req.body.openID) {
      response_type.push('id_token');
      application.token_types = ['jwt'];
      application.scope = ['openid'];
      application.jwt_secret = crypto.randomBytes(16).toString('hex').slice(0, 16);
      if (!req.body.application.grant_type.includes('hybrid')) {
        req.body.application.grant_type.push('hybrid');
      }
    }

    application
      .validate()
      .then(function () {
        return models.oauth_client.update(
          {
            name: req.body.application.name,
            description: req.body.application.description.trim(),
            url: req.body.application.url,
            redirect_uri: req.body.application.redirect_uri,
            redirect_sign_out_uri: req.body.application.redirect_sign_out_uri,
            grant_type: req.body.application.grant_type,
            response_type,
            scope: req.body.openID ? ['openid'] : null
          },
          {
            fields: [
              'name',
              'description',
              'url',
              'redirect_uri',
              'redirect_sign_out_uri',
              'grant_type',
              'response_type',
              'jwt_secret',
              'scope'
            ],
            where: { id: req.application.id }
          }
        );
      })
      .then(function () {
        // Send message of success of updating the application
        req.session.message = {
          text: ' Application updated successfully.',
          type: 'success'
        };
        res.redirect('/idm/applications/' + req.application.id);
      })
      .catch(function (error) {
        debug('Error: ' + error);
        const name_errors = [];
        if (error.errors.length) {
          for (const i in error.errors) {
            name_errors.push(error.errors[i].message);
          }
        }
        res.locals.message = {
          text: ' Unable to update application',
          type: 'danger'
        };
        req.body.application.image = req.application.image;
        res.render('applications/edit', {
          application: req.body.application,
          errors: name_errors,
          csrf_token: req.csrfToken()
        });
      });
  }
};

// DELETE /idm/applications/:application_id/edit/delete_avatar -- Delete avatar
exports.delete_avatar = function (req, res) {
  debug('--> delete_avatar');

  const image_path = 'public' + req.application.image;

  image
    .destroy(image_path)
    .then(function () {
      return models.oauth_client.update(
        { image: 'default' },
        {
          fields: ['image'],
          where: { id: req.application.id }
        }
      );
    })
    .then(function (deleted) {
      if (deleted[0] === 1) {
        // Send message of success in deleting image
        req.application.image = '/img/logos/original/app.png';
        res.send({ text: ' Deleted image.', type: 'success' });
      } else {
        // Send message of fail when deleting an image
        res.send({ text: ' Failed to delete image.', type: 'danger' });
      }
    })
    .catch(function (error) {
      debug('Error: ', error);
      res.send({ text: ' Failed to delete image.', type: 'danger' });
    });
};

// DELETE /idm/applications/:application_id -- Delete application
exports.destroy = function (req, res) {
  debug('--> destroy');

  // Destroy application with specific id
  models.oauth_client
    .destroy({
      where: { id: req.application.id }
    })
    .then(function () {
      // If the image is not the default one, delete image from filesystem
      if (req.application.image.includes('/img/applications')) {
        const image_name = req.application.image.split('/')[3];
        fs.unlink('./public/img/applications/' + image_name);
      }
      // Send message of success in deleting application
      req.session.message = { text: ' Application deleted.', type: 'success' };
      res.redirect('/idm/applications');
    })
    .catch(function (error) {
      debug('Error: ', error);
      // Send message of fail when deleting application
      req.session.message = {
        text: ' Application delete error.',
        type: 'warning'
      };
      res.redirect('/idm/applications');
    });
};

// Function to check and crop an image and to update the name in the oauth_client table
function handle_uploaded_images(req, res, redirect_uri) {
  debug('--> handle_uploaded_images');

  // Check the MIME of the file upload
  const image_path = 'public/img/applications/' + req.file.filename;
  image
    .check(image_path)
    .then(function () {
      const crop_points = {
        x: req.body.x,
        y: req.body.y,
        w: req.body.w,
        h: req.body.h
      };
      return image.crop(image_path, crop_points);
    })
    .then(function () {
      return models.oauth_client.update(
        { image: req.file.filename },
        {
          fields: ['image'],
          where: { id: req.application.id }
        }
      );
    })
    .then(function (updated) {
      const old_image = 'public' + req.application.image;
      if (updated[0] === 1) {
        // Old image to be deleted
        if (old_image.includes('/img/applications/')) {
          delete_image(req, res, old_image, true, redirect_uri, ' Image updated successfully.');
        } else {
          // Send message of success when updating image
          req.session.message = {
            text: ' Image updated successfully.',
            type: 'success'
          };
          res.redirect(redirect_uri);
        }
      } else {
        delete_image(req, res, image_path, false, redirect_uri, ' Image not updated.');
      }
    })
    .catch(function (error) {
      const message = typeof error === 'string' ? error : ' Error saving image.';
      delete_image(req, res, image_path, false, redirect_uri, message);
    });
}

// PUT /idm/applications/:application_id/change_token_type -- Select token between bearer and jwt
exports.change_token_type = function (req, res) {
  debug('--> change_token_type');

  const allowed_types = ['jwt', 'permanent'];
  const token_types = req.body.token_types ? req.body.token_types : [];

  const response = {
    message: { text: ' Failed change token type', type: 'danger' }
  };

  if (token_types.length <= 0 || token_types.every((r) => allowed_types.includes(r))) {
    const jwt_secret = token_types.includes('jwt') ? crypto.randomBytes(16).toString('hex').slice(0, 16) : null;

    models.oauth_client
      .update(
        {
          token_types,
          jwt_secret
        },
        {
          fields: ['token_types', 'jwt_secret'],
          where: { id: req.application.id }
        }
      )
      .then(function (reseted) {
        if (reseted[0] === 1) {
          if (token_types.includes('jwt')) {
            response.jwt_secret = jwt_secret;
          }
          response.message = { text: ' Change token type.', type: 'success' };
        }
        send_response(req, res, response, '/idm/applications/' + req.application.id);
      })
      .catch(function (error) {
        debug('Error: ', error);
        send_response(req, res, response, '/idm/applications/' + req.application.id);
      });
  } else {
    send_response(req, res, response, '/idm/applications/' + req.application.id);
  }
};

// GET /idm/applications/:application_id/reset_jwt_secret -- Reset jwt secret
exports.reset_jwt_secret = function (req, res) {
  debug('--> reset_jwt_secret');

  const jwt_secret = req.application.token_types.includes('jwt')
    ? crypto.randomBytes(16).toString('hex').slice(0, 16)
    : null;

  const response = { message: { text: ' Failed reset jwt.', type: 'warning' } };

  if (req.application.token_types.includes('jwt')) {
    models.oauth_client
      .update(
        {
          jwt_secret
        },
        {
          fields: ['jwt_secret'],
          where: { id: req.application.id }
        }
      )
      .then(function (reseted) {
        if (reseted[0] === 1) {
          response.jwt_secret = jwt_secret;
          response.message = { text: ' Reset jwt secret.', type: 'success' };
        }
        send_response(req, res, response, '/idm/applications/' + req.application.id);
      })
      .catch(function (error) {
        debug('Error: ', error);
        send_response(req, res, response, '/idm/applications/' + req.application.id);
      });
  } else {
    send_response(req, res, response, '/idm/applications/' + req.application.id);
  }
};

// Function to delete an image
function delete_image(req, res, image_path, success, redirect_uri, message) {
  image
    .destroy(image_path)
    .then(function () {
      req.session.message = {
        text: message,
        type: success ? 'success' : 'danger'
      };
      res.redirect(success ? redirect_uri : '/idm/applications/' + req.application.id);
    })
    .catch(function (error) {
      debug('Error: ', error);
      req.session.message = { text: ' Error saving image.', type: 'danger' };
      res.redirect('/idm/applications/' + req.application.id);
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

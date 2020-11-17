const models = require('../../models/models.js');
const debug = require('debug')('idm:web-organization_controller');
const gravatar = require('gravatar');
const fs = require('fs');

const image = require('../../lib/image.js');

// Autoload info if path include organization_id
exports.load_organization = function (req, res, next, organization_id) {
  debug('--> load_organization');

  if (req.path === '/idm/organizations/available') {
    next();
  } else {
    // Search application whose id is application_id
    models.organization
      .findById(organization_id)
      .then(function (organization) {
        // If application exists, set image from file system
        if (organization) {
          req.organization = organization;
          if (organization.image === 'default') {
            req.organization.image = '/img/logos/original/group.png';
          } else {
            req.organization.image = '/img/organizations/' + organization.image;
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
      .catch(function (error) {
        next(error);
      });
  }
};

// Check if user is owner of the organization
exports.owned_permissions = function (req, res, next) {
  debug('--> owned_permissions');

  models.user_organization
    .findOne({
      where: {
        organization_id: req.organization.id,
        user_id: req.session.user.id,
        role: 'owner'
      }
    })
    .then(function (user) {
      if (user) {
        next();
      } else {
        const message = { text: ' Not owner of organization', type: 'danger' };
        send_response(req, res, message, '/idm/organizations/' + req.organization.id);
      }
    })
    .catch(function (error) {
      debug('Error checking if user is owner of organization ' + error);
      const message = { text: ' Unable to manage request', type: 'danger' };
      send_response(req, res, message, '/idm/organizations/' + req.organization.id);
    });
};

// GET /idm/organizations -- List all organizations of user
exports.index = function (req, res) {
  debug('--> index');

  let role = 'owner';
  if (req.query.tab === 'panel_tabs__member_organizations_tab') {
    role = 'member';
  }

  models.user_organization
    .findAndCountAll({
      where: {
        user_id: req.session.user.id,
        role
      },
      include: [
        {
          model: models.organization,
          attributes: ['id', 'name', 'description', 'image']
        }
      ],
      limit: 5
    })
    .then(function (result) {
      const user_organizations = result.rows;

      const organizations = [];

      if (user_organizations.length > 0) {
        user_organizations.forEach(function (organization) {
          if (organizations.length === 0 || !organizations.some((elem) => elem.id === organization.Organization.id)) {
            if (organization.Organization.image === 'default') {
              organization.Organization.image = '/img/logos/medium/group.png';
            } else {
              organization.Organization.image = '/img/organizations/' + organization.Organization.image;
            }
            organizations.push(organization.Organization);
          }
        });
      }

      if (req.xhr) {
        res.send({ organizations, number_organizations: result.count });
      } else {
        if (req.session.message) {
          res.locals.message = req.session.message;
          delete req.session.message;
        }
        res.render('organizations/index', {
          csrf_token: req.csrfToken(),
          organizations
        });
      }
    })
    .catch(function (error) {
      debug('Error searching organizations ' + error);
      const message = {
        text: ' Unable to search organizations',
        type: 'danger'
      };
      send_response(req, res, message, '/idm');
    });
};

// GET /filters/organizations -- Filter organizations by page and number
exports.filter = function (req, res) {
  debug('--> filter');

  // Search organizations in which the user is member or owner
  models.user_organization
    .findAll({
      where: {
        user_id: req.session.user.id,
        role: req.query.role
      },
      include: [
        {
          model: models.organization,
          attributes: ['id', 'name', 'description', 'image']
        }
      ],
      offset: (req.query.page - 1) * 5,
      limit: 5
    })
    .then(function (user_organizations) {
      const organizations = [];
      // If user has organizations, set image from file system and obtain info from each organization
      if (user_organizations.length > 0) {
        user_organizations.forEach(function (org) {
          if (organizations.length === 0 || !organizations.some((elem) => elem.id === org.Organization.id)) {
            if (org.Organization.image === 'default') {
              org.Organization.image = '/img/logos/medium/group.png';
            } else {
              org.Organization.image = '/img/organizations/' + org.Organization.image;
            }
            organizations.push(org.Organization);
          }
        });
      }

      res.send({ organizations });
    })
    .catch(function (error) {
      debug('Error searching organizations ' + error);
      const message = {
        text: ' Unable to search organizations',
        type: 'danger'
      };
      send_response(req, res, message, '/idm');
    });
};

// GET /idm/organizations/new -- Render a view to create a new organization
exports.new = function (req, res) {
  debug('--> new');

  res.render('organizations/new', {
    organization: {},
    errors: [],
    csrf_token: req.csrfToken()
  });
};

// POST /idm/organizations -- Create a new organization
exports.create = function (req, res) {
  debug('--> create');

  // If body has parameters id or secret don't create application
  if (req.body.id) {
    req.session.message = {
      text: ' Organization creation failed.',
      type: 'danger'
    };
    res.redirect('/idm/organizations');
  } else {
    // Build a row and validate if input values are correct (not empty) before saving values in oauth_client
    const organization = models.organization.build(req.body.organization);
    organization
      .validate()
      .then(function () {
        return organization.save({
          fields: ['id', 'name', 'description']
        });
      })
      .then(function () {
        // Assign owner role to the user in the organizations
        return models.user_organization.create({
          organization_id: organization.id,
          role: 'owner',
          user_id: req.session.user.id
        });
      })
      .then(function () {
        res.redirect('/idm/organizations/' + organization.id);

        // Render the view once again, sending the error found when validating
      })
      .catch(function (error) {
        debug('Error: ', error);
        const name_errors = [];
        if (error.errors.length) {
          for (const i in error.errors) {
            name_errors.push(error.errors[i].message);
          }
        }
        res.locals.message = {
          text: ' Unable to create organization',
          type: 'danger'
        };
        res.render('organizations/new', {
          organization,
          errors: name_errors,
          csrf_token: req.csrfToken()
        });
      });
  }
};

// GET /idm/organizations/:organization_id -- Show info about an organization
exports.show = function (req, res) {
  debug('--> show');

  models.user_organization
    .findAll({
      where: {
        organization_id: req.organization.id,
        user_id: req.session.user.id
      }
    })
    .then(function (user_organization) {
      const roles = user_organization.map((elem) => elem.role);
      if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message;
      }
      res.render('organizations/show', {
        organization: req.organization,
        roles,
        errors: [],
        csrf_token: req.csrfToken()
      });
    })
    .catch(function (error) {
      debug('Error show organization: ' + error);
      req.session.message = {
        text: ' Unable to find organization',
        type: 'danger'
      };
      res.redirect('/idm');
    });
};

// GET /idm/organizations/:organization_id/members -- Send members of an organization
exports.get_members = function (req, res) {
  debug('--> get_members');

  models.user_organization
    .findAndCountAll({
      where: { organization_id: req.organization.id },
      include: [
        {
          model: models.user,
          where: req.query.key ? { username: { like: '%' + req.query.key + '%' } } : {},
          attributes: ['id', 'username', 'image', 'gravatar', 'email']
        }
      ],
      offset: req.query.page ? (req.query.page - 1) * 5 : 0,
      limit: 5
    })
    .then(function (result) {
      const users_organization = result.rows;

      const users = [];
      // If user has organizations, set image from file system and obtain info from each organization
      if (users_organization.length > 0) {
        users_organization.forEach(function (user) {
          if (users.length === 0 || !users.some((elem) => elem.id === user.User.id)) {
            if (user.User.gravatar) {
              user.User.image = gravatar.url(user.User.email, { s: 100, r: 'g', d: 'mm' }, { protocol: 'https' });
            } else if (user.User.image === 'default') {
              user.User.image = '/img/logos/medium/user.png';
            } else {
              user.User.image = '/img/users/' + user.User.image;
            }
            users.push(user.User);
          }
        });
      }

      res.send({ users, users_number: result.count });
    })
    .catch(function (error) {
      debug('Error get members organization: ' + error);
      const message = { text: ' Unable to find members', type: 'danger' };
      send_response(req, res, message, '/idm');
    });
};

// GET /idm/organizations/:organization_id/applications -- Send members of an organization
exports.get_applications = function (req, res) {
  debug('--> get_applications');

  const key = req.query.key ? '%' + req.query.key + '%' : '%%';
  const offset = req.query.page ? (req.query.page - 1) * 5 : 0;

  models.helpers
    .search_distinct('role_assignment', 'oauth_client', req.organization.id, 'organization', key, offset, true)
    .then(function (applications_authorized) {
      const applications = [];

      let count = 0;

      // If user has organizations, set image from file system and obtain info from each organization
      if (applications_authorized.length > 0) {
        count = applications_authorized[0].count;

        applications_authorized.forEach(function (app) {
          if (app.image === 'default') {
            app.image = '/img/logos/medium/app.png';
          } else {
            app.image = '/img/applications/' + app.image;
          }
          applications.push({
            id: app.oauth_client_id,
            name: app.name,
            image: app.image,
            url: app.url
          });
        });
      }
      res.send({ applications, applications_number: count });
    })
    .catch(function (error) {
      debug('Error get appliications authorized: ' + error);
      const message = { text: ' Unable to find applications', type: 'danger' };
      send_response(req, res, message, '/idm');
    });
};

// GET /idm/organizations/:organization_id/edit -- Show form to edit an organization
exports.edit = function (req, res) {
  debug('--> edit');

  res.render('organizations/edit', {
    organization: req.organization,
    error: [],
    csrf_token: req.csrfToken()
  });
};

// PUT /idm/organizations/:organization_id/edit/info -- Edit info of organization
exports.update_info = function (req, res) {
  debug('--> update_info');

  // Build a row and validate if input values are correct (not empty) before saving values in user table
  req.body.organization.id = req.organization.id;
  const organization = models.organization.build(req.body.organization);

  if (req.body.organization.description.replace(/^\s+/, '').replace(/\s+$/, '') === '') {
    req.body.organization.description = null;
  }

  organization
    .validate()
    .then(function () {
      return models.organization.update(
        {
          name: req.body.organization.name,
          description: req.body.organization.description,
          website: req.body.organization.website
        },
        {
          fields: ['name', 'description', 'website'],
          where: { id: req.organization.id }
        }
      );
    })
    .then(function () {
      // Send message of success of updating organization
      req.session.message = {
        text: ' organization updated successfully.',
        type: 'success'
      };
      res.redirect('/idm/organizations/' + req.organization.id);
    })
    .catch(function (error) {
      debug('Error: ', error);
      // Send message of warning of updating organization
      res.locals.message = {
        text: ' organization update failed.',
        type: 'warning'
      };
      req.body.organization.image = req.organization.image;
      res.render('organizations/edit', {
        organization: req.body.organization,
        error,
        csrf_token: req.csrfToken()
      });
    });
};

// PUT /idm/organizations/:organization_id/edit/avatar -- Edit avatar of organization
exports.update_avatar = function (req, res) {
  debug('--> update_avatar');

  // See if the user has selected a image to upload
  if (req.file) {
    handle_uploaded_images(req, res, '/idm/organizations/' + req.organization.id);
    // If not redirect to show application info
  } else {
    req.session.message = { text: ' fail updating image.', type: 'warning' };
    res.redirect('/idm/organizations/' + req.organization.id);
  }
};

// DELETE /idm/organizations/:organization_id/edit/delete_avatar -- Delete avatar of organization
exports.delete_avatar = function (req, res) {
  debug('--> delete_avatar');

  const image_path = 'public' + req.organization.image;

  image
    .destroy(image_path)
    .then(function () {
      return models.organization.update(
        { image: 'default' },
        {
          fields: ['image'],
          where: { id: req.organization.id }
        }
      );
    })
    .then(function (deleted) {
      if (deleted[0] === 1) {
        // Send message of success in deleting image
        req.organization.image = '/img/logos/original/group.png';
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

// DELETE /idm/organizations/:organization_id -- Delete an organization
exports.destroy = function (req, res) {
  debug('--> destroy');

  // Destroy application with specific id
  models.organization
    .destroy({
      where: { id: req.organization.id }
    })
    .then(function () {
      // If the image is not the default one, delete image from filesystem
      if (req.organization.image.includes('/img/organizations')) {
        const image_name = req.organization.image.split('/')[3];
        fs.unlink('./public/img/organizations/' + image_name);
      }
      // Send message of success in deleting application
      req.session.message = { text: ' Organization deleted.', type: 'success' };
      res.redirect('/idm/organizations');
    })
    .catch(function (error) {
      debug('Error: ', error);
      // Send message of fail when deleting application
      req.session.message = {
        text: ' Organization delete error.',
        type: 'warning'
      };
      res.redirect('/idm/organizations');
    });
};

// DELETE /idm/organizations/:organization_id/remove -- Handle users request to exit from the organization
exports.remove = function (req, res) {
  debug('--> remove');

  // Destroy application with specific id
  models.user_organization
    .destroy({
      where: {
        organization_id: req.organization.id,
        user_id: req.session.user.id,
        role: 'member'
      }
    })
    .then(function () {
      // Send message of success in deleting application
      req.session.message = {
        text: ' User exit from organization.',
        type: 'success'
      };
      res.redirect('/idm/organizations/' + req.organization.id);
    })
    .catch(function (error) {
      debug('Error: ', error);
      // Send message of fail when deleting application
      req.session.message = { text: ' User exit error.', type: 'danger' };
      res.redirect('/idm/organizations/' + req.organization.id);
    });
};

// Function to check and crop an image and to update the name in the oauth_client table
function handle_uploaded_images(req, res, redirect_uri) {
  // Check the MIME of the file upload
  const image_path = 'public/img/organizations/' + req.file.filename;
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
      return models.organization.update(
        { image: req.file.filename },
        {
          fields: ['image'],
          where: { id: req.organization.id }
        }
      );
    })
    .then(function (updated) {
      const old_image = 'public' + req.organization.image;
      if (updated[0] === 1) {
        // Old image to be deleted
        if (old_image.includes('/img/organizations/')) {
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

// Function to delete an image
function delete_image(req, res, image_path, success, redirect_uri, message) {
  image
    .destroy(image_path)
    .then(function () {
      req.session.message = {
        text: message,
        type: success ? 'success' : 'danger'
      };
      res.redirect(success ? redirect_uri : '/idm/organizations/' + req.organization.id);
    })
    .catch(function (error) {
      debug('Error: ', error);
      req.session.message = { text: ' Error saving image.', type: 'danger' };
      res.redirect('/idm/organizations/' + req.organization.id);
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

const debug = require('debug')('idm:api-organizations');
const diff_object = require('../../lib/object_functions.js').diff_object;
const models = require('../../models/models.js');
const uuid = require('uuid');

// MW to Autoload info if path include organization_id
exports.load_organization = function (req, res, next, organization_id) {
  debug('--> load_organization');

  // Search organization whose id is organization_id
  models.organization
    .findById(organization_id)
    .then(function (organization) {
      // If organization exists, set image from file system
      if (organization) {
        req.organization = organization;
        next();
      } else {
        res.status(404).json({
          error: {
            message: 'Organization not found',
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

// MW to check role organization
exports.load_organization_role = function (req, res, next, organization_role_id) {
  debug('--> load_organization_role');

  if (organization_role_id === 'owner' || organization_role_id === 'member') {
    req.role_organization = organization_role_id;
    next();
  } else {
    res.status(404).json({
      error: {
        message: 'Organization role not found',
        code: 404,
        title: 'Not Found'
      }
    });
  }
};

// MW to check role of user in organization
exports.owned_permissions = function (req, res, next) {
  debug('--> owned_permissions');

  models.user_organization
    .findOne({
      where: {
        organization_id: req.organization.id,
        user_id: req.token_owner.id,
        role: 'owner'
      }
    })
    .then(function (row) {
      if (row) {
        next();
      } else {
        res.status(403).json({
          error: {
            message: 'User not allow to perform the action',
            code: 403,
            title: 'Forbidden'
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

// GET /v1/organizations -- Send index of organizations
exports.index = function (req, res) {
  debug('--> index');

  // Search organizations in wich user is member or owner
  models.user_organization
    .findAll({
      where: { user_id: req.token_owner.id },
      attributes: ['role'],
      include: [
        {
          model: models.organization,
          attributes: ['id', 'name', 'description', 'image', 'website']
        }
      ]
    })
    .then(function (organizations) {
      if (organizations.length > 0) {
        res.status(200).json({ organizations });
      } else {
        res.status(404).json({
          error: {
            message: 'Organizations not found',
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

// POST /v1/organizations -- Create organization
exports.create = function (req, res) {
  debug('--> create');

  // Build a row and validate if input values are correct (not empty) before saving values in oauth_client
  check_create_body_request(req.body)
    .then(function () {
      const organization = models.organization.build(req.body.organization);

      organization.image = 'default';
      organization.id = uuid.v4();

      const create_organization = organization.save({
        fields: ['id', 'name', 'description', 'website', 'image']
      });

      const create_assignment = create_organization.then(function (organization) {
        return models.user_organization.create({
          organization_id: organization.id,
          role: 'owner',
          user_id: req.token_owner.id
        });
      });

      return Promise.all([create_organization, create_assignment])
        .then(function (values) {
          res.status(201).json({ organization: values[0].dataValues });
        })
        .catch(function (error) {
          return Promise.reject(error);
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

// GET /v1/organizations/:organization_id -- Get info about organization
exports.info = function (req, res) {
  debug('--> info');

  res.status(200).json({ organization: req.organization });
};

// PUT /v1/organizations/:organization_id -- Edit organization
exports.update = function (req, res) {
  debug('--> update');

  let organization_previous_values = null;

  check_update_body_request(req.body)
    .then(function () {
      organization_previous_values = JSON.parse(JSON.stringify(req.organization.dataValues));

      req.organization.name = req.body.organization.name ? req.body.organization.name : req.organization.name;
      req.organization.website = req.body.organization.website
        ? req.body.organization.website
        : req.organization.website;
      req.organization.description = req.body.organization.description
        ? req.body.organization.description
        : req.organization.description;
      req.organization.image = 'default';

      return req.organization.save();
    })
    .then(function (organization) {
      const difference = diff_object(organization_previous_values, organization.dataValues);
      const response =
        Object.keys(difference).length > 0
          ? { values_updated: difference }
          : {
              message: "Request don't change the organization parameters",
              code: 200,
              title: 'OK'
            };
      res.status(200).json(response);
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

// DELETE /v1/organizations/:organization_id -- Delete organization
exports.delete = function (req, res) {
  debug('--> delete');

  req.organization
    .destroy()
    .then(function () {
      res.status(204).json('Organization ' + req.params.organization_id + ' destroyed');
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
    if (!body.organization) {
      reject({
        error: {
          message: 'Missing parameter organization in body request',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (!body.organization.name) {
      reject({
        error: {
          message: 'Missing parameter name in body request or empty name',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else {
      resolve();
    }
  });
}

// Check body in update request
function check_update_body_request(body) {
  return new Promise(function (resolve, reject) {
    if (!body.organization) {
      reject({
        error: {
          message: 'Missing parameter organization in body request',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else if (body.organization.id) {
      reject({
        error: { message: 'Cannot set id', code: 400, title: 'Bad Request' }
      });
    } else if (body.organization.name && body.organization.name.length === 0) {
      reject({
        error: {
          message: 'Cannot set empty name',
          code: 400,
          title: 'Bad Request'
        }
      });
    } else {
      resolve();
    }
  });
}

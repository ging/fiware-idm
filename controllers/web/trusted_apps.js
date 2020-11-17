const models = require('../../models/models.js');

const debug = require('debug')('idm:web-trusted_apps_controller');

// GET /idm/applications/:application_id/get_trusted_applications -- Send authorizes users of an application
exports.get_trusted_applications = function (req, res) {
  debug('--> get_trusted_applications');

  models.trusted_application
    .findAll({
      where: { oauth_client_id: req.application.id },
      attributes: ['trusted_oauth_client_id'],
      include: [
        {
          model: models.oauth_client,
          attributes: ['id', 'name', 'image', 'url']
        }
      ]
    })
    .then(function (result) {
      const applications = result.map(function (id) {
        if (id.OauthClient.dataValues.image === 'default') {
          id.OauthClient.dataValues.image = '/img/logos/original/app.png';
        } else {
          id.OauthClient.dataValues.image = '/img/applications/' + id.OauthClient.dataValues.image;
        }
        return id.OauthClient.dataValues;
      });
      res.send({ applications });
    })
    .catch(function (error) {
      debug('Error ' + error);

      res.status(500).send('Internal error');
    });
};

// GET /idm/applications/:application_id/set_trusted_applications -- Send authorizes users of an application
exports.set_trusted_applications = function (req, res) {
  debug('--> set_trusted_applications');

  let array_id_trusted = JSON.parse(req.body.submit_trusted);

  // Remove possible duplicates and null values
  array_id_trusted = array_id_trusted.filter(function (item, index, input_array) {
    return item && item !== req.application.id && input_array.indexOf(item) === index;
  });

  models.trusted_application
    .destroy({
      where: {
        oauth_client_id: req.application.id
      }
    })
    .then(function () {
      // Array of objects with oauth_client_id and trusted_oauth_client_id
      const create_trusted = [];

      for (let i = 0; i < array_id_trusted.length; i++) {
        create_trusted.push({
          oauth_client_id: req.application.id,
          trusted_oauth_client_id: array_id_trusted[i]
        });
      }

      models.trusted_application
        .bulkCreate(create_trusted)
        .then(function () {
          req.session.message = {
            text: ' Modified trusted applications.',
            type: 'success'
          };
          res.redirect('/idm/applications/' + req.application.id);
        })
        .catch(function (error) {
          debug('Error ' + error);
          req.session.message = {
            text: ' Trusted applications error.',
            type: 'warning'
          };
          res.redirect('/idm/applications/' + req.application.id);
        });
    })
    .catch(function (error) {
      debug('Error ' + error);
      req.session.message = {
        text: ' Trusted applications error.',
        type: 'warning'
      };
      res.redirect('/idm/applications/' + req.application.id);
    });
};

// GET /idm/applications/available -- Search users to authorize in an application
exports.available_applications = function (req, res) {
  debug('--> available_applications');

  // Obtain key to search in the organization table
  const key = req.query.key;

  if (key.length > 1 && key.includes('%') === false && key.includes('_') === false) {
    // Search if username is like the input key
    models.oauth_client
      .findAll({
        attributes: ['name', 'id', 'image'],
        where: {
          name: {
            like: '%' + key + '%'
          }
        }
      })
      .then(function (applications) {
        // If found, send ana array of applications with the name and the id of each one
        if (applications.length > 0) {
          applications.forEach(function (elem) {
            if (elem.image !== 'default') {
              elem.image = '/img/applications/' + elem.image;
            } else {
              elem.image = '/img/logos/medium/app.png';
            }
          });
          res.send({ applications });
        } else {
          // If the result is null send an error message
          res.send({ applications: [] });
        }
      });
  } else {
    res.send({ applications: [] });
  }
};

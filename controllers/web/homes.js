const models = require('../../models/models.js');

const debug = require('debug')('idm:web-home_controller');

// GET /idm -- List all applications
exports.index = function (req, res) {
  debug('--> index');

  // See if there is a message store in session
  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }

  // Search applications in which the user is authorized
  const get_app = models.helpers
    .search_distinct('role_assignment', 'oauth_client', req.session.user.id, 'user', '%%', 0, false)
    .then(function (user_applications) {
      const applications = [];

      // If user has applications, set image from file system and obtain info from each application
      if (user_applications.length > 0) {
        user_applications.forEach(function (app) {
          if (app.image === 'default') {
            app.image = '/img/logos/medium/app.png';
          } else {
            app.image = '/img/applications/' + app.image;
          }
          applications.push(app);
        });
      }

      // Order applications and render view
      applications.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });

      return applications;
    });

  // Search organizations in which the user is member or owner
  const get_org = models.user_organization
    .findAll({
      where: { user_id: req.session.user.id },
      include: [
        {
          model: models.organization,
          attributes: ['id', 'name', 'description', 'image']
        }
      ],
      limit: 5
    })
    .then(function (user_organizations) {
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

      // Order applications and render view
      organizations.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });

      return organizations;
    });

  Promise.all([get_app, get_org])
    .then(function (values) {
      //---------------
      res.render('home/index', {
        // res.render('home/home', {
        applications: values[0],
        organizations: values[1],
        change_password: req.session.user.change_password,
        errors: [],
        csrf_token: req.csrfToken()
      });
    })
    .catch(function (error) {
      debug('Error: ', error);
      //-------
      res.render('home/index', {
        // res.render('home/home', {
        applications: [],
        organizations: [],
        change_password: req.session.user.change_password,
        errors: [],
        csrf_token: req.csrfToken()
      });
    });
};

// Render help_about
exports.help_about = function (req, res) {
  debug('--> help_about');

  res.render('help_about', { csrf_token: req.csrfToken() });
};

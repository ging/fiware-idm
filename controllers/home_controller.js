var models = require('../models/models.js');

// List all applications
exports.index = function(req, res) {
  models.oauth_client.findAll().then(function(application) {
  	res.render('home/index', { applications: application, errors: []});
  });
};
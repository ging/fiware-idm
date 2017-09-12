var models = require('../models/models.js');

// Autoload info if path include applicationid
exports.load = function(req, res, next, applicationId) {
  models.Application.findById(applicationId).then(function(application) {
  	if (application) {
  		req.application = application;
  		next();
  	} else { next(new Error("No existe la aplicacion con id = " + applicationId));}
  }).catch(function(error) { next(error); });
};

// Form for new application
exports.new = function(req, res) {
	res.render('applications/new', {applicationInfo: {}, errors: []})
};

// Create new application
exports.create = function(req, res, next) {
	var application = models.Application.build(req.body.application);
	application.validate().then(function(err) {
		application.save({fields: ["name", "description", "url", "callbackurl", "clientId", "clientSecret"]}).then(function() {
			res.redirect('/idm/applications');
		});	
	}).catch(function(error){ 
    console.log(error)
	 	res.render('applications/new', { applicationInfo: application, errors: error.errors}); 
	});
};

// List all applications
exports.index = function(req, res) {
  models.Application.findAll().then(function(application) {
  	res.render('applications/index', { applications: application, errors: []});
  });
};

// Show info about an application
exports.show = function(req, res) {
  res.render('applications/show', { applicationInfo: req.application, errors: []});
};

// Edit application
exports.edit = function(req, res) {
  res.render('applications/edit', { applicationInfo: req.application, errors: []});
};

// Update application
exports.update = function(req, res) {
	req.application.name = req.body.application.name;
	req.application.description = req.body.application.description;
	req.application.applicationId = req.body.application.applicationId;
	req.application.applicationSecret = req.body.application.applicationSecret;

	req.application.validate().then(function(err) {
		req.application.save({fields: ["name", "description", "applicationId", "applicationSecret"]}).then(function() {
			res.redirect('/idm/applications/'+req.application.id);
		});	
	}).catch(function(error){ 
	 	res.render('applications/edit', { applicationInfo: req.application, errors: error.errors}); 
	});
};

// Delete application
exports.destroy = function(req, res) {
  req.application.destroy().then( function() {
    res.redirect('/idm/applications');
  }).catch(function(error){next(error)});
};

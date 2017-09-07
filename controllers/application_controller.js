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
	res.render('newApplication', {applicationInfo: {}, errors: []})
};

// Create new application
exports.create = function(req, res, next) {
	var application = models.Application.build(req.body.application);
	application.validate().then(function(err) {
		application.save({fields: ["Name", "Description", "ApplicationId", "ApplicationSecret"]}).then(function() {
			res.redirect('/indexApplication');
		});	
	}).catch(function(error){ 
	 	res.render('newApplication', { applicationInfo: application, errors: error.errors}); 
	});
};

// List all applications
exports.index = function(req, res) {
  models.Application.findAll().then(function(application) {
  	res.render('indexApplication', { applications: application, errors: []});
  })
};

// Show info about an application
exports.show = function(req, res) {
  res.render('showApplication', { applicationInfo: req.application, errors: []});
};

// Edit application
exports.edit = function(req, res) {
  res.render('editApplication', { applicationInfo: req.application, errors: []});
};

// Update application
exports.update = function(req, res) {
  	req.application.Name = req.body.application.Name;
  	req.application.Description = req.body.application.Description;
  	req.application.ApplicationId = req.body.application.ApplicationId;
  	req.application.ApplicationSecret = req.body.application.ApplicationSecret;

	req.application.validate().then(function(err) {
		req.application.save({fields: ["Name", "Description", "ApplicationId", "ApplicationSecret"]}).then(function() {
			res.redirect('/indexApplication/'+req.application.id);
		});	
	}).catch(function(error){ 
	 	res.render('editApplication', { applicationInfo: req.application, errors: error.errors}); 
	});
};

// Delete application
exports.destroy = function(req, res) {
  req.application.destroy().then( function() {
    res.redirect('/indexApplication');
  }).catch(function(error){next(error)});
};

var models = require('../models/models.js');

// Autoload info if path include applicationid
exports.load = function(req, res, next, applicationId) {
	models.oauth_client.findById(applicationId).then(function(application) {
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
	var application = models.oauth_client.build(req.body.application);
	application.validate().then(function(err) {
		application.save({fields: ["id", "name", "description", "url", "redirect_uri", "secret"]}).then(function() {
			models.role_user.create({ oauth_client_id: application.id, user_id: req.session.user.id}).then(function(newAssociation) {
				res.redirect('/idm/applications');
			}).catch(function(error){ 
		    	console.log(error)
			 	res.render('applications/new', { applicationInfo: application, errors: error.errors}); 
			});	
		});	
	}).catch(function(error){ 
    	console.log(error)
	 	res.render('applications/new', { applicationInfo: application, errors: error.errors}); 
	});	
};

// List all applications
exports.index = function(req, res) {
	models.role_user.findAll({
		where: { user_id: req.session.user.id },
		include: [models.oauth_client]
	}).then(function(user_applications) {
		if (user_applications) {
			var applications = [];
			for (i = 0; i < user_applications.length; i++) {
				applications.push(user_applications[i].OauthClient);	
			}
			res.render('applications/index', { applications: applications, errors: []});
		}
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

// Show roles and permissions
exports.edit_roles = function(req, res, next) {
	models.role.findAll({
		where: { oauth_client_id: req.application.id }
	}).then(function(application_roles) {
		if (application_roles) {
			res.render('applications/manage_roles', { application: { id: req.application.id, roles: application_roles}});
		} else { next(new Error("No existe la aplicacion con id = " + applicationId));}
	}).catch(function(error) { next(error); });
}

// Create new roles
exports.create_roles = function(req, res) {
	var role = models.role.build({ name: req.body.name, oauth_client_id: req.application.id });
	role.validate().then(function(err) {
		role.save({fields: ["id", "name", "oauth_client_id"]}).then(function() {
			res.send(role);
		})
	}).catch(function(error) {
		console.log(error.errors[0].message)
		res.send(error.errors);
	});
}

// Delete application
exports.destroy = function(req, res) {
  req.application.destroy().then( function() {
    res.redirect('/idm/applications');
  }).catch(function(error){next(error)});
};

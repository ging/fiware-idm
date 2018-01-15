var models = require('../models/models.js');
var debug = require('debug')('idm:organization_controller');


// Autoload info if path include organizationId
exports.load_organization = function(req, res, next, organizationId) {

	debug("--> load_organization");

	// Search application whose id is applicationId
	models.organization.findById(organizationId).then(function(organization) {
		// If application exists, set image from file system
		if (organization) {
			req.organization = organization
			if (organization.image == 'default') {
				req.organization.image = '/img/logos/original/group.png'
			} else {
				req.organization.image = '/img/organizations/'+organization.image
			}
			// Send request to next function
			next();
		} else {
			// Reponse with message
			var response = {text: ' Organization doesn`t exist.', type: 'danger'};

			// Send response depends on the type of request
			send_response(req, res, response, '/idm/organizations');
		}
	}).catch(function(error) { next(error); });
}


// GET /idm/organizations -- List all organizations of user
exports.index = function(req, res) {

	res.render('organizations/index', {csrfToken: req.csrfToken()})
	/*debug("--> index");
	
	var role = 'provider'
	if (req.query.tab === 'panel_tabs__purchased_tab') {
		role = 'purchaser'
	} else if (req.query.tab === 'panel_tabs__authorized_tab') {
		role = { [Op.notIn]: ['provider', 'purchaser'] }
	} 

	// Search applications in which the user is authorized
	models.role_user.findAndCountAll({
		where: { user_id: req.session.user.id,
				 role_id: role },
		include: [{
			model: models.oauth_client,
			attributes: ['id', 'name', 'url', 'image']
		}],
		limit: 5
	}).then(function(result) {
		var user_applications = result.rows;
		// Set message to send when rendering view and delete from request
		if (req.session.message) {
			res.locals.message = req.session.message;
			delete req.session.message
		}

		var applications = []
		// If user has applications, set image from file system and obtain info from each application
		if (user_applications.length > 0) {
			
			user_applications.forEach(function(app) {
				if (applications.length == 0 || !applications.some(elem => (elem.id == app.OauthClient.id))) {
					if (app.OauthClient.image == 'default') {
						app.OauthClient.image = '/img/logos/medium/app.png'
					} else {
						app.OauthClient.image = '/img/applications/'+app.OauthClient.image
					}
					applications.push(app.OauthClient)
				} 
			});
		}
		if (req.xhr) {
			res.send({applications: applications, number_applications: result.count})
		} else {
			res.render('applications/index', { applications: applications, number_applications: result.count, errors: [], csrfToken: req.csrfToken()});			
		}
	}).catch(function(error) { next(error); });*/
};

// GET /idm/organizations/new -- Render a view to create a new organization
exports.new = function(req, res) {

	debug("--> new");

	res.render('organizations/new', {organization: {}, errors: [], csrfToken: req.csrfToken()})
};

// POST /idm/organizations -- Create a new organization
exports.create = function(req, res) {

	debug("--> create");

	// If body has parameters id or secret don't create application
	if (req.body.id) {
		req.session.message = {text: ' Organization creation failed.', type: 'danger'};
		res.redirect('/idm/organizations')
	} else {
		// Build a row and validate if input values are correct (not empty) before saving values in oauth_client
		var organization = models.organization.build(req.body.organization);
		organization.validate().then(function(err) {
			organization.save({fields: [ 'id', 
										'name', 
										'description']
			}).then(function(){
				res.redirect('/idm/organizations/'+organization.id)
			}).catch(function(error){
				res.locals.message = {text: ' Unable to create organization',type: 'danger'}
			 	res.render('organizations/new', { organization: organization, errors: [], csrfToken: req.csrfToken()});
			});	

		// Render the view once again, sending the error found when validating
		}).catch(function(error){
			var nameErrors = []
			if (error.errors.length) {
        		for (var i in error.errors) {
        			nameErrors.push(error.errors[i].message)
        		}
  			}
		 	res.render('organizations/new', { organization: organization, errors: nameErrors, csrfToken: req.csrfToken()}); 
		});
	}
};


// GET /idm/organizations/:organizationId -- Show info about an application
exports.show = function(req, res, next) {
	res.render('organizations/show', { organization: req.organization, errors: [], csrfToken: req.csrfToken()});
}


// Funtion to see if request is via AJAX or Browser and depending on this, send a request
function send_response(req, res, response, url) {
	if (req.xhr) {
		res.send(response);
	} else {
		if (response.message) {
			req.session.message = response.message	
		} else {
			req.session.message = response;
		}
		res.redirect(url);
	}
}
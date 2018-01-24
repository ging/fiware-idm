var models = require('../models/models.js');
var debug = require('debug')('idm:organization_controller');
var gravatar = require('gravatar');


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

// Check if user is owner of the organization
exports.owned_permissions = function(req, res, next) {
	
	debug("--> owned_permissions");

	models.user_organization.findOne({
		where: { organization_id: req.organization.id, user_id: req.session.user.id, role: 'owner'}
	}).then(function(user) {
		if (user) {
			next()
		} else {
			var message = {text: ' Not owner of organization',type: 'danger'}
			send_response(req, res, message, '/idm/organizations/'+req.organization.id)
		}
	}).catch(function(error) {
		debug('Error checking if user is owner of organization ' + error)
		var message = {text: ' Unable to manage request',type: 'danger'}
		send_response(req, res, message, '/idm/organizations/'+req.organization.id)
	})
}


// GET /idm/organizations -- List all organizations of user
exports.index = function(req, res) {

	debug("--> index");

	var role = 'owner'
	if (req.query.tab === 'panel_tabs__member_organizations_tab') {
		role = 'member'
	}

	models.user_organization.findAndCountAll({
		where: { user_id: req.session.user.id,
		 		 role: role},
		include: [{
			model: models.organization,
			attributes: ['id', 'name', 'description', 'image']
		}],
		limit: 5
	}).then(function(result) {
		
		var user_organizations = result.rows;

		var organizations = [];
		
		if (user_organizations.length > 0) {
			
			user_organizations.forEach(function(organization) {
				if (organizations.length == 0 || !organizations.some(elem => (elem.id == organization.Organization.id))) {
					if (organization.Organization.image == 'default') {
						organization.Organization.image = '/img/logos/medium/group.png'
					} else {
						organization.Organization.image = '/img/organizations/'+organization.Organization.image
					}
					organizations.push(organization.Organization)
				} 
			});
		}

		if (req.xhr) {
			res.send({organizations: organizations, number_organizations: result.count})
		} else {
			res.render('organizations/index', {csrfToken: req.csrfToken(), organizations: organizations})
		}
		
	}).catch(function(error) {
		debug('Error searching organizations ' + error)
		var message = {text: ' Unable to search organizations',type: 'danger'}
		send_response(req, res, message, '/idm')
	})
};

// GET /filters/organizations -- Filter organizations by page and number
exports.filter = function(req, res) {

	debug("--> filter");

	// Search organizations in which the user is member or owner
	models.user_organization.findAll({
		where: { user_id: req.session.user.id,
				 role: req.query.role },
		include: [{
			model: models.organization,
			attributes: ['id', 'name', 'description', 'image']
		}],
		offset: (req.query.page - 1)*5,
		limit: 5
	}).then(function(user_organizations) {

		var organizations = []
		// If user has organizations, set image from file system and obtain info from each organization
		if (user_organizations.length > 0) {
			
			user_organizations.forEach(function(org) {
				if (organizations.length == 0 || !organizations.some(elem => (elem.id == org.Organization.id))) {
					if (org.Organization.image == 'default') {
						org.Organization.image = '/img/logos/medium/group.png'
					} else {
						org.Organization.image = '/img/organizations/'+org.Organization.image
					}
					organizations.push(org.Organization)
				} 
			});
		}

		res.send({organizations: organizations})
	}).catch(function(error) { 
		debug('Error searching organizations ' + error)
		var message = {text: ' Unable to search organizations',type: 'danger'}
		send_response(req, res, message, '/idm')
	});
}

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
				// Assign owner role to the user in the organizations
        		models.user_organization.create({ 
        			organization_id: organization.id, 
        			role: 'owner', 
        			user_id: req.session.user.id
        		}).then(function(newAssociation) {
					res.redirect('/idm/organizations/'+organization.id)
        		})
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


// GET /idm/organizations/:organizationId -- Show info about an organization
exports.show = function(req, res, next) {

	debug("--> show");

	models.user_organization.findAll({
		where: { organization_id: req.organization.id, user_id: req.session.user.id}
	}).then(function(user_organization) {
		var roles = user_organization.map(elem => elem.role)
		if (req.session.message) {
			res.locals.message = req.session.message
			delete req.session.message
		}
		res.render('organizations/show', { organization: req.organization, roles: roles, errors: [], csrfToken: req.csrfToken()});
	}).catch(function(error) {
		debug('Error show organization: ' + error)
		req.session.message = {text: ' Unable to find organization',type: 'danger'}
		res.redirect('/idm')
	})
}

// GET /idm/organizations/:organizationId -- Show info about an organization
exports.get_members = function(req, res, next) {

	debug("--> get_members");

	models.user_organization.findAndCountAll({
		where: { organization_id: req.organization.id },
		include: [{
			model: models.user,
			where: (req.query.key) ? { username: { like: '%' + req.query.key + '%' } } : {} ,
			attributes: ['id', 'username', 'image', 'gravatar', 'email']
		}],
		offset: (req.query.page) ? (req.query.page - 1)*5 : 0,
		limit: 5
	}).then(function(result) {

		var users_organization = result.rows;

		var users = []
		// If user has organizations, set image from file system and obtain info from each organization
		if (users_organization.length > 0) {
			
			users_organization.forEach(function(user) {
				if (users.length == 0 || !users.some(elem => (elem.id == user.User.id))) {
					if (user.User.gravatar) {
            			user.User.image = gravatar.url(user.User.email, {s:100, r:'g', d: 'mm'}, {protocol: 'https'});
					} else if (user.User.image == 'default') {
						user.User.image = '/img/logos/medium/user.png'
					} else {
						user.User.image = '/img/users/'+user.User.image
					}
					users.push(user.User)
				} 
			});
		}

		res.send({users: users, users_number: result.count})
	}).catch(function(error) {
		debug('Error get members organization: ' + error)
		var message = {text: ' Unable to find members',type: 'danger'}
		send_response(req, res, message, '/idm')
	})
}

// GET /idm/organizations/:organizationId/edit -- Show form to edit an organization
exports.edit = function(req, res, next) {

	debug("--> edit");

	res.render('organizations/edit', { organization: req.organization, error: [], csrfToken: req.csrfToken()});
}


// PUT /idm/organizations/:organizationId/edit/info -- Edit info of organization
exports.update_info = function(req, res, next) {
	
	debug("--> update_info")

    // Build a row and validate if input values are correct (not empty) before saving values in user table
    req.body.organization['id'] = req.organization.id;
    var organization = models.organization.build(req.body.organization);

    if (req.body.organization.description.replace(/^\s+/, '').replace(/\s+$/, '') === '') {
        req.body.organization.description = null
    }

    organization.validate().then(function(err) {
        models.organization.update(
            { name: req.body.organization.name,
              description: req.body.organization.description,
              website: req.body.organization.website },
            {
                fields: ['name','description','website'],
                where: {id: req.organization.id}
            }
        ).then(function() {
            // Send message of success of updating organization
            req.session.message = {text: ' organization updated successfully.', type: 'success'};
            res.redirect('/idm/organizations/'+req.organization.id);
        }).catch(function(error){
            debug('Error updating values of organization ' + error)
            req.session.message = {text: ' Fail update organization.', type: 'danger'};
            res.redirect('/idm/organizations/'+req.organization.id);
        })
    }).catch(function(error){ 

        // Send message of warning of updating organization
        res.locals.message = {text: ' organization update failed.', type: 'warning'};
        req.body.organization['image'] = req.organization.image
        res.render('organizations/edit', { organization: req.body.organization, error: error, csrfToken: req.csrfToken()});
    });
}


// PUT /idm/organizations/:organizationId/edit/avatar -- Edit avatar of organization
exports.update_avatar = function(req, res, next) {

}


// DELETE /idm/organizations/:organizationId/edit/delete_avatar -- Delete avatar of organization
exports.delete_avatar = function(req, res, next) {

}


// DELETE /idm/organizations/:organizationId -- Delete an organization
exports.destroy = function(req, res, next) {

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
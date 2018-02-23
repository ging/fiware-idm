var models = require('../../models/models.js');

var config = require('../../config').database;

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var sequelize = new Sequelize(config.database, config.username, config.password, 
  { 
    host: config.host,
    dialect: config.dialect
  }      
);

var debug = require('debug')('idm:web-home_controller')

// GET /idm -- List all applications
exports.index = function(req, res) {

	debug("--> index")

	// See if there is a message store in session
	if (req.session.message) {
		res.locals.message = req.session.message
		delete req.session.message  
	}

	// Search applications in which the user is authorized
	var query = `SELECT DISTINCT role_assignment.oauth_client_id, oauth_client.id, oauth_client.name, oauth_client.image, oauth_client.url 
				FROM role_assignment 
				RIGHT JOIN (SELECT * FROM oauth_client) AS oauth_client
				ON role_assignment.oauth_client_id=oauth_client.id 
				WHERE user_id=:user_id
				LIMIT 5`

	var get_app = sequelize.query(query, {replacements: {user_id: req.session.user.id}, type: Sequelize.QueryTypes.SELECT}).then(function(user_applications){

		var applications = []

		// If user has applications, set image from file system and obtain info from each application
		if (user_applications.length > 0) {

			user_applications.forEach(function(app) {
				if (app.image == 'default') {
					app.image = '/img/logos/medium/app.png'
				} else {
					app.image = '/img/applications/'+app.image
				}
				applications.push(app)
			});
		}

		// Order applications and render view
		applications.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} )

		return applications;
	});

	// Search organizations in which the user is member or owner
	var get_org = models.user_organization.findAll({
		where: { user_id: req.session.user.id },
		include: [{
			model: models.organization,
			attributes: ['id', 'name', 'description','image']
		}],
		limit: 5
	}).then(function(user_organizations) {
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

		// Order applications and render view
		organizations.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} )

		return organizations;
	});

	Promise.all([get_app, get_org]).then(function(values) {
		res.render('home/index', { applications: values[0], organizations: values[1], change_password: req.session.user.change_password, errors: [], csrfToken: req.csrfToken()});
	}).catch(function(error){
		res.render('home/index', { applications: [], organizations: [], change_password: req.session.user.change_password, errors: [], csrfToken: req.csrfToken()});
	})
};

// Render help_about
exports.help_about = function(req, res) {
	debug("--> help_about")
	
	res.render("help_about", {csrfToken: req.csrfToken()})
}
var models = require('../models/models.js');

// GET /idm -- List all applications
exports.index = function(req, res) {

	// Search applications in which the user is authorized
	models.role_user.findAll({
		where: { user_id: req.session.user.id },
		include: [{
			model: models.oauth_client,
			attributes: ['id', 'name', 'url','image']
		}]
	}).then(function(user_applications) {

		// If user has applications, set image from file system and obtain info from each application
		if (user_applications.length > 0) {
			var applications = []
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

			// Order applications and render view
			applications.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} )
			res.render('home/index', { applications: applications, errors: []});

		} else {
			res.render('home/index', { applications: [], errors: []});
		}
	});
};
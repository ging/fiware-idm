var models = require('../models/models.js');

// List all applications
exports.index = function(req, res) {
	models.role_user.findAll({
		where: { user_id: req.session.user.id },
		include: [{
			model: models.oauth_client,
			attributes: ["id", "name", "url"]
		}]
	}).then(function(user_applications) {
		if (user_applications) {
			var applications = []
			user_applications.forEach(function(app) {
				if (applications.length == 0 || !applications.some(elem => (elem.id == app.OauthClient.id))) {
					applications.push(app.OauthClient)
				} 
			});

			res.render('home/index', { applications: applications, errors: []});
		}
	});
};
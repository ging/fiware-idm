var models = require('../models/models.js');

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
			res.render('home/index', { applications: applications, errors: []});
		}
	});
};
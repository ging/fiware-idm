var models = require('../../models/models.js');
var gravatar = require('gravatar');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

var debug = require('debug')('idm:web-trusted_apps_controller')

// GET /idm/applications/:applicationId/get_trusted_applications -- Send authorizes users of an application
exports.get_trusted_applications = function(req, res, next) {

	debug("--> get_trusted_applications");

	var applications = {
		applications: [
			{
				id: '1111111111',
				image: '/img/logos/medium/app.png',
				url: 'puaj',
				name: '1111111111'
			}, 
			{
				id: '2222222222',
				image: '/img/logos/medium/app.png',
				url: 'puaj',
				name: '2222222222'
			}, 
			{
				id: '3333333333',
				image: '/img/logos/medium/app.png',
				url: 'puaj',
				name: '3333333333'
			}, 
			{
				id: '4444444444',
				image: '/img/logos/medium/app.png',
				url: 'puaj',
				name: '4444444444'
			}, 
			{
				id: '5555555555',
				image: '/img/logos/medium/app.png',
				url: 'puaj',
				name: '5555555555'
			},
			{
				id: '6666666666',
				image: '/img/logos/medium/app.png',
				url: 'puaj',
				name: '6666666666'
			}, 
			{
				id: '3333333333',
				image: '/img/logos/medium/app.png',
				url: 'puajirl',
				name: '3333333333'
			}
		]
	}

	res.send(applications)
}

// GET /idm/applications/:applicationId/set_trusted_applications -- Send authorizes users of an application
exports.set_trusted_applications = function(req, res, next) {

	debug("--> set_trusted_applications");

	
}

// GET /idm/applications/available -- Search users to authorize in an application
exports.available_applications = function(req, res) {

	debug("--> available_applications")

	// Obtain key to search in the organization table
	var key = req.query.key

	if (key.length > 1 && key.includes("%") == false && key.includes("_") == false) {
		// Search if username is like the input key
		models.oauth_client.findAll({
		 	attributes: ['name', 'id', 'image'],
			where: {
	            name: {
	                like: '%' + key + '%'
	            }
	        }
		}).then(function(applications) {

			// If found, send ana array of applications with the name and the id of each one
			if (applications.length > 0) {
				applications.forEach(function(elem, index, array) {
					if (elem.image !== 'default') {
	                    elem.image = '/img/applications/' + elem.image
	                } else {
	                	elem.image = '/img/logos/medium/app.png'
	                }
				});
				res.send({applications: applications})
			} else {
				// If the result is null send an error message
				res.send({applications: []})
			}
		});
	} else {
		res.send({applications: []})
	}

}
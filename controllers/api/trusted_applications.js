var debug = require('debug')('idm:api-trusted_applications');
var models = require('../../models/models.js');

var api_check_perm_controller = require('./check_permissions');

// MW to Autoload info if path include trustedApplicationId
exports.load_trusted_application = function(req, res, next, trustedApplicationId) {

	debug("--> load_trusted_application");

	if (trustedApplicationId === 'idm_admin_app') {
		res.status(403).json({error: {message: "Not allowed", code: 403, title: "Forbidden"}})
	} else {
		// Search application whose id is trustedApplicationId
		models.oauth_client.findById(trustedApplicationId).then(function(trusted_application) {
			// If application exists, set image from file system
			if (trusted_application) {
				req.trusted_application = trusted_application.id
				next()
			} else {
				res.status(404).json({error: {message: "Application to be add as trusted not found", code: 404, title: "Not Found"}})
			}
		}).catch(function(error) { 
			debug('Error: ' + error)
			if (!error.error) {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
			res.status(error.error.code).json(error)
		});
	}
}

// GET /v1/applications/:applicationId/trusted_applications -- Send index of trusted applications
exports.index = function(req, res) {
	debug('--> index')

	models.trusted_application.findAll({
		where: {oauth_client_id: req.application.id },
		attributes: ['trusted_oauth_client_id']
	}).then(function(trusted_applications) {
		if (trusted_applications.length > 0) {
			res.status(200).json({trusted_applications: trusted_applications.map(id => id.trusted_oauth_client_id)});
		} else {
			res.status(404).json({error: {message: "Trusted applications nof found", code: 404, title: "Not Found"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// POST /v1/applications/:applicationId/trusted_applications/:trustedApplicationId -- Add trusted application
exports.create = function(req, res) {
	debug('--> create')

	if (req.application.id === req.trusted_application) {
		res.status(400).json({ error: {message: 'Bad request', code: 400, title: 'Bad Request'}})
	} else {
		models.trusted_application.findOrCreate({
			where: { oauth_client_id: req.application.id, trusted_oauth_client_id: req.trusted_application },
			defaults: { oauth_client_id: req.application.id, trusted_oauth_client_id: req.trusted_application }
		}).spread(function(assignment, created) {
			if (created) {
				res.status(201).json({ oauth_client_id: req.application.id, trusted_oauth_client_id: req.trusted_application });
			} else {
				res.status(400).json({ error: {message: 'Trusted application already added', code: 400, title: 'Bad Request'}})
			}
		}).catch(function(error) {
			debug('Error: ' + error)
			if (!error.error) {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
			res.status(error.error.code).json(error)
		})
	}

}

// POST /v1/applications/:applicationId/trusted_applications/:trustedApplicationId -- Delete trusted application
exports.delete = function(req, res) {
	debug('--> delete')

	if (req.application.id === req.trusted_application) {
		res.status(400).json({ error: {message: 'Bad request', code: 400, title: 'Bad Request'}})
	} else {
		models.trusted_application.destroy({
			where: { oauth_client_id: req.application.id, trusted_oauth_client_id: req.trusted_application }
		}).then(function(deleted) {
			if (deleted) {
				res.status(204).json('success');
			} else {
				res.status(400).json({ error: {message: 'Application has not that trusted application added', code: 400, title: 'Bad Request'}})
			}
		}).catch(function(error) {
			debug('Error: ' + error)
			if (!error.error) {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
			res.status(error.error.code).json(error)
		})
	}
}

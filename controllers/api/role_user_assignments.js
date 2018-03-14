var debug = require('debug')('idm:api-role_user_assignments');
var models = require('../../models/models.js');

// GET /v1/applications/:applicationId/users/:user_id/roles -- Send index of role user assignment
exports.index = function(req, res) {
	debug('--> index')

	models.role_assignment.findAll({
		where: { user_id: req.user.id, oauth_client_id: req.application.id},
		attributes: ['user_id', 'role_id']
	}).then(function(rows) {
		if (rows.length > 0)
			res.status(201).json({role_user_assignments: rows});
		else {
			res.status(404).json({error: {message: "Assignments not found", code: 404, title: "Not Found"}})
		}
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// POST /v1/applications/:applicationId/users/:user_id/roles/:role_id -- Edit role user assignment
exports.assign = function(req, res) {

	debug('--> assign')

	models.role_assignment.findOrCreate({
		where: { role_id: req.role.id, user_id: req.user.id, oauth_client_id: req.application.id },
		defaults: { role_id: req.role.id, user_id: req.user.id, oauth_client_id: req.application.id }
	}).spread(function(assignment, created) {
		delete assignment.dataValues.id
		delete assignment.dataValues.organization_id
		delete assignment.dataValues.role_organization
		res.status(201).json({role_user_assignments: assignment});
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}

// DELETE /v1/applications/:applicationId/users/:user_id/roles/:role_id -- Remove role user assignment
exports.remove = function(req, res) {

	debug('--> remove')

	models.role_assignment.destroy({
		where: { role_id: req.role.id, user_id: req.user.id, oauth_client_id: req.application.id }
	}).then(function(deleted) {
		res.status(204).json("Assignment destroyed");
	}).catch(function(error) {
		debug('Error: ' + error)
		if (!error.error) {
			error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
		}
		res.status(error.error.code).json(error)
	})
}
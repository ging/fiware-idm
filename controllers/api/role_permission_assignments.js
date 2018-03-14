var debug = require('debug')('idm:api-role_permission_assignments');
var models = require('../../models/models.js');

// GET /v1/applications/:applicationId/roles/:role_id/permissions -- Send index of role permissions assignments
exports.index = function(req, res) {
	debug('--> index')

	models.role_permission.findAll({
		where: { role_id: req.role.id},
		attributes: ['role_id', 'permission_id'],
		include: [{
			model: models.permission,
			attributes: ['id', 'is_internal', 'name', 'description', 'action', 'resource', 'xml']
		}]
	}).then(function(rows) {
		if (rows.length > 0)
			res.status(201).json({role_permission_assignments: rows.map(elem => elem.Permission)});
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

// PUT /v1/applications/:applicationId/roles/:role_id/permissions/:permission_id -- Edit role permission assignment
exports.assign = function(req, res) {

	debug('--> assign')

	if (req.role.id === 'provider' || req.role.id === 'purchaser') {
		res.status(403).json({error: {message: "Not allowed", code: 403, title: "Forbidden"}})
	} else {
		models.role_permission.findOrCreate({
			where: { role_id: req.role.id, permission_id: req.permission.id },
			defaults: { role_id: req.role.id, permission_id: req.permission.id }
		}).spread(function(assignment, created) {
			delete assignment.dataValues.id
			res.status(201).json({role_permission_assignments: assignment});
		}).catch(function(error) {
			debug('Error: ' + error)
			if (!error.error) {
				error = { error: {message: 'Internal error', code: 500, title: 'Internal error'}}
			}
			res.status(error.error.code).json(error)
		})
	}
}

// DELETE /v1/applications/:applicationId/roles/:role_id/permissions/:permission_id -- Remove role permission assignment
exports.remove = function(req, res) {

	debug('--> remove')
	
	if (req.role.id === 'provider' || req.role.id === 'purchaser') {
		res.status(403).json({error: {message: "Not allowed", code: 403, title: "Forbidden"}})
	} else {
		models.role_permission.destroy({
			where: { role_id: req.role.id, permission_id: req.permission.id }
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
}
var debug = require('debug')('idm:api-role_user_assignments');
var models = require('../../models/models.js');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

// GET /v1/applications/:applicationId/users -- Send index of role user assignment
exports.index_users = function(req, res) {
	debug('--> index')

	models.role_assignment.findAll({
		where: { oauth_client_id: req.application.id, user_id: { [Op.ne]: null }, organization_id: { [Op.eq]: null }},
		attributes: ['user_id', 'role_id']
	}).then(function(assignments) {
		
		if (req.changeable_role) {
			var changeable_role_id = req.changeable_role.map(elem => elem.id)
			for (var i = 0; i < assignments.length; i++) {
				if (!changeable_role_id.includes(assignments[i].role_id)){
					assignments.splice(i, 1)
					i = i - 1
				}
			}
		}

		if (assignments.length > 0)
			res.status(200).json({role_user_assignments: assignments});
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

// GET /v1/applications/:applicationId/users/:user_id/roles -- Send index of role user assignment
exports.index_user_roles = function(req, res) {
	debug('--> info')

	models.role_assignment.findAll({
		where: { user_id: req.user.id, oauth_client_id: req.application.id},
		attributes: ['user_id', 'role_id']
	}).then(function(rows) {
		
		if (req.changeable_role) {
			var changeable_role_id = req.changeable_role.map(elem => elem.id)
			for (var i = 0; i < rows.length; i++) {
				if (!changeable_role_id.includes(rows[i].role_id)){
					rows.splice(i, 1)
					i = i - 1
				}
			}
		}

		if (rows.length > 0) {
			res.status(200).json({role_user_assignments: rows});
		}
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
exports.create = function(req, res) {

	debug('--> create')

	if (req.changeable_role) {
		var changeable_role_id = req.changeable_role.map(elem => elem.id)
		if (!changeable_role_id.includes(req.role.id)) {
			res.status(403).json({ error: {message: 'User not allow to perform the action', code: 403, title: 'Forbidden'}})	
		}
	}
	
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
exports.delete = function(req, res) {

	debug('--> delete')

	if (req.changeable_role) {
		var changeable_role_id = req.changeable_role.map(elem => elem.id)
		if (!changeable_role_id.includes(req.role.id)) {
			res.status(403).json({ error: {message: 'User not allow to perform the action', code: 403, title: 'Forbidden'}})	
		}
	}

	models.role_assignment.destroy({
		where: { role_id: req.role.id, user_id: req.user.id, oauth_client_id: req.application.id }
	}).then(function(deleted) {
		if (deleted) {
			res.status(204).json("Assignment destroyed");
		} else {
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
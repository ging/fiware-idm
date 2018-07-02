var models = require('../../models/models.js');
var debug = require('debug')('idm:web-list_users_controller')


// GET /idm/admins/list_users -- Render list users
exports.list_users =function(req, res, next) {

	debug('--> list_users')

	res.render('admin/users', { csrfToken: req.csrfToken(), errors: [] })
}

// GET /idm/admins/list_users/users -- Send users
exports.users =function(req, res, next) {

	debug('--> users')

}
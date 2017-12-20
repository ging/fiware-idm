var models = require('../models/models.js');
var debug = require('debug')('idm:settings_controller')

// GET /settings -- Render settings view
exports.settings = function(req, res) {
    debug("--> settings")

    res.render("settings/settings")
}

// POST /settings/password -- Change password
exports.password = function(req, res) {
    debug("--> password")

    debug(req.body)
}


// POST /settings/email -- Set ne email address
exports.email = function(req, res) {
    debug("--> email")

    debug(req.body)
}

// DELETE /settings/cancel -- cancle account of user logged
exports.cancel_account = function(req, res) {
    debug("--> cancel_account")

    models.user.destroy({
		where: { id: req.session.user.id }
	}).then(function(destroyed) {
		if (destroyed) {
			delete req.session.user;
			req.session.message = { text: 'Account cancelled succesfully.', type: 'success'}
			res.redirect('/auth/login')
		} else {
			req.session.message = { text: 'Account not cancelled', type: 'danger'}
			res.redirect('/')
		}
	}).catch(function(error) {
		debug('  -> error' + error)
		res.redirect('/')
	})
}
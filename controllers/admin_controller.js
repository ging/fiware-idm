var models = require('../models/models.js');
var mailer = require('../lib/mailer').mailer();
var debug = require('debug')('idm:admin_controller')

// See if user is administrator
exports.is_admin =function(req, res, next) {

	debug('--> is_admin')

	if (req.session.user.admin) {
		next();
	} else {
		res.redirect('/')
	}
}
////////////// poner el meTODO HTTP QUE ESTAN IMPLEMENTANDO
/////////////////

// Render notify view
exports.show_notify = function(req, res) {
	debug('--> notify')

	res.render("admin/notify")
}

exports.send_message = function(req, res) {
	debug('--> send_message')

	res.send("send_message")
}

// Render administrators view
exports.index_administrators = function(req, res) {
	debug('--> administrators')

	res.render("admin/administrators")
}

exports.update_administrators = function(req, res) {
	debug('--> update_administrators')

	res.send("update_administrators")
}

// Render user_accounts view
exports.show_user_accounts = function(req, res) {
	debug('--> user_accounts')

	res.render("admin/user_accounts")
}

exports.send_user = function(req, res) {
	debug('--> send_user')

	res.send("send_user")
}

// Render user_accounts_update view
exports.show_user_accounts_update = function(req, res) {
	debug('--> user_accounts_update')

	res.render("admin/user_accounts_update")
}

exports.update_user_accounts_update = function(req, res) {
	debug('--> update_user_accounts_update')

	res.send("update_user_accounts_update")
}
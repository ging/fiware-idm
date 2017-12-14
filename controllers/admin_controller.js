var models = require('../models/models.js');
var mailer = require('../lib/mailer').mailer();
var debug = require('debug')('idm:admin_controller')
var gravatar = require('gravatar');


// See if user is administrator
exports.is_admin =function(req, res, next) {

	debug('--> is_admin')

	if (req.session.user.admin) {
		next();
	} else {
		res.redirect('/')
	}
}

// GET /idm_admin/notify -- Render notify view
exports.show_notify = function(req, res) {
	debug('--> notify')

	res.render("admin/notify")
}

// POST /idm_admin/notify -- Send message with info obtain from body
exports.send_message = function(req, res) {
	debug('--> send_message')
	debug(req.body)
	res.send("send_message")
}

// GET /idm_admin/administrators --  Render administrators view
exports.index_administrators = function(req, res) {
	debug('--> administrators')

	models.user.findAll({
		where: { admin: true },
		attributes: ['id', 'username', 'email', 'image', 'gravatar']
	}).then(function(users) {
		var users_admin = []
		users.forEach(function(user) {			
			debug(user)
			var image = '/img/logos/medium/user.png'
            if (user.gravatar) {
				image = gravatar.url(user.email, {s:36, r:'g', d: 'mm'}, {protocol: 'https'});
			} else if (user.image !== 'default') {
                image = '/img/users/' + user.image
            }
			users_admin.push({  id: user.id, 
								username: user.username,
								image: image });
		})

		res.render("admin/administrators", { users_admin: users_admin })
	}).catch(function(error) {
		console.log(error)
		res.redirect('/')
	})
}

// PUT /idm_admin/administrators --  Give admin role to specified users
exports.update_administrators = function(req, res) {
	debug('--> update_administrators')

	res.send("update_administrators")
}

// GET /idm_admin/user_accounts --  Render user_accounts view
exports.show_user_accounts = function(req, res) {
	debug('--> user_accounts')

	res.render("admin/user_accounts", { error: []})
}

// POST /idm_admin/user_accounts --  Search for user info using email
exports.send_user = function(req, res) {
	debug('--> send_user')

	models.user.findOne({
		where: { email: req.body.email},
		attributes: ['id', 'email', 'username']
	}).then(function(user){
		debug(user)
		if (user) {
			res.send(user)
		} else {
			res.render("admin/user_accounts", {error: 'not_found'})
		}
	}).catch(function(error) {
		debug(error)
		res.redirect('/')
	})
}

// GET /idm_admin/user_accounts/:userId/update --  Render user_accounts_update view
exports.show_user_accounts_update = function(req, res) {
	debug('--> user_accounts_update')

	res.render("admin/user_accounts_update")
}

// PUT /idm_admin/user_accounts/:userId/update --  Update user to trial, basic or community role
exports.update_user_accounts_update = function(req, res) {
	debug('--> update_user_accounts_update')

	res.send("update_user_accounts_update")
}
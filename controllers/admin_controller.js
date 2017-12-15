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
	debug(req.body)

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

	// Find which user corresponds to the input email
	models.user.findOne({
		where: { email: req.body.email},
		attributes: ['id', 'email', 'username', 'account_type', 'duration_account_type', 'started_date_account_type']
	}).then(function(user){

		// If user found render view with information about user
		if (user) {
			debug(user)
			if (user.account_type) {
				user['start'] = user.started_date_account_type
				var date_start = new Date(user.started_date_account_type)
				user['expires'] = date_start.addDays(user.duration_account_type).toISOString().slice(0,10)
			}
			res.render("admin/user_accounts_update", { user: user })
		} else {
			res.render("admin/user_accounts", {error: 'not_found'})
		}
	}).catch(function(error) {
		res.redirect('/')
	})
}

// PUT /idm_admin/user_accounts/:userId/update --  Update user to trial, basic or community role
exports.update_user_accounts_update = function(req, res) {
	debug('--> update_user_accounts_update')
	// SEE HHOW TO DO WITH REGIONS AND DE OWNER ROLE WHO IS
	// WHAT TRIAL COMMUNITY AND BASIC INVOLVE
	// LA DURACION POR DEFECTO PUEDE QUE NO TENGA QUE SER 0. DEBIDO AL BASIC QUE NO TIENE
	var date = new Date().toISOString().slice(0,10); 

	// See if request include roles differents to community, trial and basic
	if (!['community', 'trial', 'basic'].includes[req.body.account_type]) {
		var date = null;

		// If the role is trial or community set start date. If is trial set duration to 0
		if (['community', 'trial'].includes(req.body.account_type)) {
			date = new Date().toISOString().slice(0,10); 
		} else {
			req.body.duration = 0
		}

		// Update database with values
		models.user.update({
			account_type: req.body.account_type,
			duration_account_type: parseInt(req.body.duration),
			started_date_account_type: date
		}, {
			where: { id: req.user.id },
			fields: ['account_type', 'duration_account_type', 'started_date_account_type']
		}).then(function(updated) {

			// If success updating database send an email and redirect to
			if (updated[0] === 1) {
				if (req.body.notify === 'on') {
					debug('send_an_email')
				}
				req.session.message = {text: ' Success updating user .', type: 'success'};
				res.redirect('/')
			} else {
				req.session.message = {text: ' Fail updating user .', type: 'warning'};
				res.redirect('/')
			}
		}).catch(function(error) {
			res.redirect('/')
		});
	} else {
		req.session.message = {text: ' Invalid role.', type: 'danger'};
		res.redirect('/')
	}
}

// Function to add days to specific date
Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}
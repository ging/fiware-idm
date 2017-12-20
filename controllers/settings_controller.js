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

    var errors = []
    
    // If password new is empty push an error into the array
    if (req.body.new_password == "") {
        errors.push("new_password");
    }

    // If password(again) is empty push an error into the array
    if (req.body.confirm_password == "") {
        errors.push("confirm_password");
    }


    // If the two password are differents, send an error
    if (req.body.new_password !== req.body.confirm_password) {
        errors.push("password_different");
    }

    // If current password is empty send a message
    if (req.body.current_password == "") {
        errors.push("current_password");
    }


	if (errors.length > 0) {
		res.render('settings/password', {errors: errors})
	} else {
		// Search the user through the email
	    models.user.find({
	        where: {
	            id: req.session.user.id
	        }
	    }).then(function(user) {
	        if (user) {
	            // Verify password and if user is enabled to use the web
	            if(user.verifyPassword(req.body.current_password)) {
	            	// HACER ALGO
	            	res.locals.message = { text: 'JAJAJ', type: 'success'}
	                res.render('settings/password', {errors: errors})
	            } else { 
	            	res.locals.message = { text: 'Unable to change password. Unauthorized', type: 'danger'}
	            	res.render('settings/password', {errors: errors})
	        	}   
	        } else { callback(new Error('invalid')); }
	    }).catch(function(error){ callback(error) });
	}
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
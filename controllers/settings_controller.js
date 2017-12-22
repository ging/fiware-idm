var models = require('../models/models.js');
var debug = require('debug')('idm:settings_controller')
var config = require('../config');
var email = require('../lib/email.js')

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

    // If current password is empty send a message
    if (req.body.current_password == "") {
        errors.push("current_password");
    }

    // If the two password are differents, send an error
    if (req.body.new_password !== req.body.confirm_password) {
        errors.push("password_different");
    }

    // If there are erros render the view with them. If not check password of user
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

	            	models.user.update({ 
	            		password: req.body.new_password,
	            		date_password_change: new Date((new Date()).getTime())
	            	},{
						fields: ['password', 'date_password_change'],
						where: {id: req.session.user.id}
					}).then(function() {
						delete req.session.user
						req.session.errors = [{ message: 'password_change' }]
						res.redirect('/auth/login')
	            	}).catch(function(error) {
	            		debug('  -> error' + error)
						res.redirect('/auth/login')
	            	})
	            } else { 
	            	res.locals.message = { text: 'Unable to change password. Unauthorized', type: 'danger'}
	            	res.render('settings/password', {errors: errors})
	        	}   
	        } else { callback(new Error('invalid')); }
	    }).catch(function(error){ callback(error) });
	}
}


// POST /settings/email -- Set new email address
exports.email = function(req, res) {
    
    debug("--> email")
    
    var errors = []

    // If password new is empty push an error into the array
    if (req.body.email == "") {
        errors.push("email");
    }

    // If password(again) is empty push an error into the array
    if (req.body.password == "") {
        errors.push("password");
    }

    // If there are erros render the view with them. If not check password of user
	if (errors.length > 0) {
		res.render('settings/email', {errors: errors})
	} else {

		// If is the actual email send a message of error to the user
		if (req.session.user.email === req.body.email) {
			res.locals.message = { text: ' It is your actual email.', type: 'warning'}
			res.render('settings/email', {errors: errors})
		}
		models.user.findOne({
			where: { email: req.body.email}
		}).then(function(user) {
			if (user)  {
				res.locals.message = { text: ' Email already used.', type: 'danger'}
				res.render('settings/email', {errors: errors})
			} else {
				// Search the user through the email
			    models.user.find({
			        where: {
			            id: req.session.user.id
			        }
			    }).then(function(user) {
			        if (user) {
			            // Verify password and if user is enabled to use the web
			            if(user.verifyPassword(req.body.password)) {	      

			           		var verification_key = Math.random().toString(36).substr(2);
			                var verification_expires = new Date((new Date()).getTime() + 1000*3600*24)

			                models.user.update(
			                    { verification_key: verification_key,
			                      verification_expires: verification_expires 
			                }, {
			                    fields: ['verification_key', 'verification_expires'],
			                    where: { id: user.id}
			                }).then(function() {

			                    // Send an email to the user
			                    var link = config.host + '/settings/email/verify?verification_key=' + verification_key + '&new_email=' + req.body.email;

			                    var mail_data = {
			                        name: user.username,
			                        link: link
			                    };

			                    var subject = 'Account email change requested';

			                    // Send an email message to the user
			                    email.send('change_email', subject, req.body.email, mail_data)

			                    res.locals.message = { text: `An emails has been sent to verify your account.
				            								  Follow the provided link to change your email`,
				            						   type: 'success'}
				            	res.render('settings/settings')
			                }).catch(function(error) {
			                    debug('  -> error' + error)
			                    res.redirect('/')
			                })		               
			            } else { 
			            	res.locals.message = { text: 'Invalid password', type: 'danger'}
			            	res.render('settings/email', {errors: errors})
			        	}   
			        } else { 
			        	callback(new Error('invalid'));
			        }
			    }).catch(function(error){ callback(error) });
			}
		}).catch(function(error) {
			debug('  -> error' + error)
			res.redirect('/')
		})
	}
}

// GET /settings/email/verify -- Confirm change of email
exports.email_verify = function(req, res) {
    
    debug("--> email_verify")

    if (req.session.user) {

    	// Search the user through the id
	    models.user.find({
	        where: {
	            id: req.session.user.id
	        }
	    }).then(function(user) {
            if (user.verification_key === req.query.verification_key) {
                if ((new Date()).getTime() > user.verification_expires.getTime()) {
                    res.locals.message = {text: 'Error changing email address', type: 'danger'};
                    res.render('index', { errors: [] });
                } else {
                    models.user.update({ 
                        email: req.query.new_email
                    },{
                        fields: ['email'],
                        where: { id: req.session.user.id }
                    }).then(function() {
                    	req.session.user.email = req.query.new_email
                        res.locals.message = { text: ' Email successfully changed', type: 'success'}
                        res.render('settings/settings')
                    }).catch(function(error) {
                        debug('  -> error ' + error)
                        res.redirect('/')
                    })   
                }
            }
	    }).catch(function(error){ 
	    	debug('  -> error' + error)
			res.redirect('/')
	    }); 
    } else {
    	req.session.message = { text: ' You need to be logged to change email address.', type: 'danger'}
    	res.redirect('/auth/login')
    }
   
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
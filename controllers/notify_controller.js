var models = require('../models/models.js');
var debug = require('debug')('idm:notify_controller')
var gravatar = require('gravatar');

var email = require('../lib/email.js')


// GET /idm_admin/notify -- Render notify view
exports.show_notify = function(req, res) {
	debug('--> notify')

	res.render("admin/notify", { errors: {}, users: [], subject: '', csrfToken: req.csrfToken() })
}

// POST /idm_admin/notify -- Send message with info obtain from body
exports.send_message = function(req, res) {
	debug('--> send_message')

	// Objects of errors to be sent to the view
	var errors = {}

	// If subject field is empty send an error message
	if (!req.body.subject) {
		errors['subject'] = true
	}

	// Check which option has been selected by the admin user
	switch(req.body.notify) {
	    case 'all_users':
	        debug(' -> all_users')

	        if (Object.keys(errors).length > 0) {
	        	errors['option'] = 'all_users'
	        	res.render("admin/notify", {errors: errors, users: [], subject: '', csrfToken: req.csrfToken()})
	        } else {
		        // Get all enabled users
		        get_all_users().then(function(users) {

		        	// Map array of users to get emails and join all these emails into a string
		        	var emails =  users.map(elem => elem.email).join()
		        			     
		        	// Send an email message to the user
		        	email.send('', req.body.subject, emails, req.body.body)

		        	req.session.message = {text: ' Success sending email.', type: 'success'};
		        	res.redirect('/')
		        }).catch(function(error) {
		        	debug('  -> error' + error)
		        	res.redirect('/')
		        })		        
	        }
	        break;
	    case 'organization':
	        debug('  -> organization')
	        /////////////////////////// DIVIDIR CADA CASE EN FUNCIONES
	        if (errors) {
	        	res.render("admin/notify", {errors: errors, csrfToken: req.csrfToken()})
	        } else {
	    		res.locals.message = {text: ' Not implemented.', type: 'danger'};
	        	res.render("admin/notify", {csrfToken: req.csrfToken()})
	        }

	    	/*get_organization(req, res).then(function(organization) {
	    		debug('IMPLEMENTAR')
	    	}).catch(function(error) {
	    		debug(error)
	    	})*/
	        break;
	    case 'users_by_id':
	        debug(' -> users_by_id')

	        var user_ids = req.body.user_ids.split(',')

	        // Delete white spaces
	        for (var i =0; i < user_ids.length; i++) {
	        	// If is an empety element delete
	        	if (user_ids[i] == "") {         
			      user_ids.splice(i, 1);
			      i--;
			    } else {
	        		user_ids[i] = user_ids[i].trim();				    	
			    }
	        }

	        if (user_ids.length > 0) {

		        check_users_by_id(user_ids).then(function(result) {

		        	// If users not found send an error message
		        	if (result.users_not_found.length > 0) {
		        		errors['users_not_found'] = result.users_not_found
		        	}

		        	if (Object.keys(errors).length > 0) {
		        		errors['option'] = 'users_by_id'
		        		res.render("admin/notify", {errors: errors, users: req.body.user_ids, subject: req.body.subject, csrfToken: req.csrfToken()})
			        } else {
			    		// Map array of users to get emails and join all these emails into a string
			        	var emails =  result.users.map(elem => elem.email).join()

			        	// Send an email message to the user
			        	email.send('', req.body.subject, emails, req.body.body)

			        	req.session.message = {text: ' Success sending email.', type: 'success'};
			        	res.redirect('/')
			        }
		        }).catch(function(error) {
		        	debug('  -> error' + error)
		        	res.redirect('/')
		        })
	        } else {
	        	errors['option'] = 'users_by_id'
	        	errors['not_users'] = true
		        res.render("admin/notify", {errors: errors, users: req.body.user_ids, subject: req.body.subject, csrfToken: req.csrfToken()})
	        }
	        break;
	    default:
	    	res.locals.message = {text: ' Invalid option.', type: 'warning'}
	        res.render("admin/notify", {errors: {}, users: [], subject: '', csrfToken: req.csrfToken()})
	}
}


// Function to gel all emails of users enabled from database
function get_all_users() {
	return models.user.findAll({
		where: { enabled: true},
		attributes: ['email']
	}).then(function(users) {
		return users
	}).catch(function(error) {
		return error
	})
}

// Function to gel all emails of users from a specific organization
function get_organization(organization_id) {
	
}

// Function to check if all ids receive from client are in database
function check_users_by_id(user_ids) {

	return models.user.findAll({
		where: { id: user_ids, enabled: true },
		attributes: ['id', 'email']
	}).then(function(users) {

		// Check if users requested are in the database
		var users_not_found = user_ids.filter(function(id) {
			return !(users.map(elem => elem.id).includes(id))
		})
		return {users_not_found: users_not_found, users: users}
	}).catch(function(error) {
		return error
	})
}

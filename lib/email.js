var mailer = require('../lib/mailer').mailer();
var debug = require('debug')('idm:email');
var ejs = require('ejs');

// Function te fill message template and send this to specific users
exports.send = function(view, subject, emails, message, translation) {

	debug(' --> send_email')

	// Merge all objects needed to fill the email template
	var render = { ...{view: view}, ...{translation: translation}, ...{data: message}}

	// If there is no view specified it means that is a custom email from admin/notifies view
	subject = (view) ? translation.templates.email[view]["subject"] : subject 

	ejs.renderFile(__dirname + '/../views/templates/email/base_email.ejs', render, function(error, mail) {
    	// Error
    	if (error) { debug('  -> error' + error) }

        mailer.sendMail({to: emails, html: mail, subject: subject}, function(ev){
            debug('  -> Result mail: '+ ev);
        });
    })
}
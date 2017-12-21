var mailer = require('../lib/mailer').mailer();
var debug = require('debug')('idm:email');
var ejs = require('ejs');

// Function te fill message template and send this to specific users
exports.send = function(view, subject, emails, message) {

	debug(' --> send_email')

	ejs.renderFile(__dirname + '/../views/templates/_base_email.ejs', {view: view,data: message}, function(error, mail) {
    	// Error
    	if (error) { debug('  -> error' + error) }

        mailer.sendMail({to: emails, html: mail, subject: subject}, function(ev){
            debug('  -> Result mail: '+ ev);
        });
    })
}
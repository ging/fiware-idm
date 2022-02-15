const config_service = require('../lib/configService.js');
const config = config_service.get_config();
const mailer = require('../lib/mailer').mailer();
const path = require('path');
const debug = require('debug')('idm:email');
const ejs = require('ejs');
const fs = require('fs');

// Function te fill message template and send this to specific users
exports.send = function (view, subject, emails, message, translation, lang) {
  debug(' --> send_email');

  // Merge all objects needed to fill the email template
  const render = {
    ...{ view },
    ...{ translation },
    ...{ data: message },
    ...{ config },
    ...{ fs },
    ...{ lang }
  };

  // If there is no view specified it means that is a custom email from admin/notifies view
  subject = view ? translation.templates.email[view].subject : subject;

  ejs.renderFile(path.join(__dirname, '/../views/templates/email/base_email.ejs'), render, function (error, mail) {
    // Error
    if (error) {
      debug('  -> error' + error);
    }

    mailer.sendMail({ to: emails, html: mail, subject }, function (ev) {
      debug('  -> Result mail: ' + ev);
    });
  });
};

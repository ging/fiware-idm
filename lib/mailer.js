const nodemailer = require('nodemailer');
const smtp_transport = require('nodemailer-smtp-transport');
const debug = require('debug')('idm:mailer');

exports.mailer = function() {
  const that = {};

  const config = require('../config.js').mail;

  if (config === undefined) {
    debug('Configuration for email not set, will not send emails');
    config.host = '';
    config.port = 25;
    config.from = 'this@notanemail.com';
  }

  config.tls = {
    rejectUnauthorized: false, // eslint-disable-line snakecase/snakecase
  };

  const transporter = nodemailer.createTransport(smtp_transport(config));

  that.sendMail = function(mail_info, callback) {
    transporter.sendMail(
      {
        from: config.from,
        to: mail_info.to,
        subject: mail_info.subject,
        html: mail_info.html,
      },
      function(ev) {
        let returns = null;
        if (ev == null) {
          returns = 'SUCCESS';
        } else if (ev.code === 'ECONNREFUSED') {
          debug(
            'Mail server refuses the connection, please review the configuration'
          );
          returns = ev.code;
        }
        callback(returns);
      }
    );
  };

  return that;
};

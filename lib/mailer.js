const nodemailer = require('nodemailer');
const smtp_transport = require('nodemailer-smtp-transport');
const mailgun_transport = require('nodemailer-mailgun-transport');
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

  let transport;
  if (config.transport === 'mailgun') {
    transport = mailgun_transport({
      auth: {
        api_key: config.mailgun_api_key,
        domain: config.domain,
      },
    });
  } else {
    transport = smtp_transport(config);
  }

  const transporter = nodemailer.createTransport(transport);

  that.sendMail = function(mail_info, callback) {
    transporter.sendMail(
      {
        from: config.from,
        to: mail_info.to,
        subject: mail_info.subject,
        html: mail_info.html,
      },
      function(err, info) {
        let returns = null;
        if (err) {
          if (err.code === 'ECONNREFUSED') {
            debug(
              'Mail server refuses the connection, please review the configuration'
            );
          } else {
            debug('Error while sending the email', err.code, info);
          }
          returns = err.code;
        } else {
          returns = 'SUCCESS';
        }
        callback(returns);
      }
    );
  };

  return that;
};

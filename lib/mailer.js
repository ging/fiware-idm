var nodemailer = require ('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

exports.mailer = function (spec){
    var that = {},
        config = require ('../config.js').mail;
  
    if (config === undefined) {
        console.error("Configuration for email not set, will not send emails");
        config.host ="";
        config.port = 25;
        config.from = "this@notanemail.com";
    }
    
    var transporter = nodemailer.createTransport(smtpTransport({
        host: config.host,
        port: config.port,
        tls: {
            rejectUnauthorized: false
        }
    }));

    that.sendMail = function (mailInfo, callback) {
        transporter.sendMail({
            from: config.from,
            to: mailInfo.to,
            subject: mailInfo.subject,
            html: mailInfo.html
        }, function (ev) {
            var returns = null;
            if (ev == null){
                returns = "SUCCESS";
            }
            else if (ev.code === "ECONNREFUSED"){
                console.error("Mail server refuses the connection, please review the configuration");
                returns = ev.code;
            }
            callback(returns);
        });
    }
 
    return that;

};

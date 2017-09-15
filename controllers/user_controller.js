var models = require('../models/models.js');
var mailer = require('../lib/mailer').mailer();
var config = require('../config');
var ejs = require('ejs');

// See if user is registered
exports.authenticate = function(email, password, callback) {
    models.User.find({
        where: {
            email: email
        }
    }).then(function(user) {
        if (user) {
            if(user.verifyPassword(password) && user.enabled){
                callback(null, user);
            } else { callback(new Error('invalid')); }   
        } else { callback(new Error('invalid')); }
    }).catch(function(error){ callback(error) });
};

// Form for new user
exports.new = function(req, res) {
    res.render('users/new', {userInfo: {}, errors: []});
};

// Create new user
exports.create = function(req, res, next) {
    errors = [];
    var user = models.User.build({
        username: req.body.username, 
        email: req.body.email, 
        password: req.body.password1,
        enabled: false,
        activation_key: Math.random().toString(36).substr(2),
        activation_expires: new Date((new Date()).getTime() + 1000*3600*24)     // 1 day
    });
    if (req.body.password2 == "") {
        errors.push({message: "password2"});
    }
    user.validate().then(function(err) {
        if (req.body.password1 != req.body.password2) {
            errors.push({message: "passwordDifferent"});
            throw new Error("passwordDifferent");
        } else {
            user.save().then(function() {
                
                var link = config.host + '/activate?activation_key=' + user.activation_key + '&user=' + user.id;

                var mail_data = {
                    name: user.username,
                    link: link
                };

                var subject = 'Welcome to FIWARE';

                ejs.renderFile(__dirname + '/../views/templates/_base_email.ejs', {view: 'activate', data: mail_data}, function(result, mail) {
                    mailer.sendMail({to: user.email, html: mail, subject: subject}, function(ev){
                        console.log("Result mail", ev);
                    });
                });

                res.locals.message = {text: 'Account created succesfully, check your email for the confirmation link.', type: 'success'};
                res.render('index', { errors: [] });
            }); 
        }
    }).catch(function(error){ 
        if (error.message != "passwordDifferent") {
            errors = errors.concat(error.errors);
        }
        console.log(errors)
        res.render('users/new', { userInfo: user, errors: errors}); 
    });
};

// Activate user
exports.activate = function(req, res, next) {
    models.User.find({
        where: {
            id: req.query.user
        }
    }).then(function(user) {
        if (user) {
            if (user.enabled) {
                res.locals.message = {text: 'User already activated', type: 'warning'};
                res.render('index', { errors: [] });
            } else if (user.activation_key === req.query.activation_key) {
                if ((new Date()).getTime() > user.activation_expires.getTime()) {
                    res.locals.message = {text: 'Error activating user', type: 'danger'};
                    res.render('index', { errors: [] });
                } else {
                    user.enabled = true;
                    user.save().then(function() {
                        res.locals.message = {text: 'User activated. login using your credentials.', type: 'success'};
                        res.render('index', { errors: [] });
                    }); 
                }
            };
        } else {
            res.locals.message = {text: 'Error activating user', type: 'danger'};
            res.render('index', { errors: [] });
        }
        

    }).catch(function(error){ callback(error) });
}
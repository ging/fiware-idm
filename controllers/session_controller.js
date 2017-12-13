var models = require('../models/models.js');

var debug = require('debug')('idm:session_controller')
var gravatar = require('gravatar');

// MW to authorized restricted http accesses
exports.login_required = function(req, res, next){

    debug("--> login_required");

    if (req.session.user) {
        next();
    } else {
        req.session.errors = [{message: 'sessionExpired'}];
        res.redirect('/auth/login');
    }
};

// GET /auth/login -- Form for login
exports.new = function(req, res) {

    debug("--> new");

    var errors = req.session.errors || {};
    delete req.session.errors;
    if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message
    }
    res.render('index', {errors: errors});
};

// POST /auth/login -- Create Session
exports.create = function(req, res) {

    debug("--> create");

    // If inputs email or password are empty create an array of errors
    errors = []
    if (!req.body.email) {
        errors.push({message: 'email'});
    }
    if (!req.body.password) {
        errors.push({message: 'password'});
    }

    var userController = require('./user_controller');

        if (req.body.email && req.body.password) {
            // Authenticate user using user controller function
            userController.authenticate(req.body.email, req.body.password, function(error, user) {

                if (error) {  // If error exists send a message to /auth/login
                    req.session.errors = [{message: error.message}];
                    res.redirect("/auth/login");        
                    return;
                }

                // Create req.session.user and save id and username
                // The session is defined by the existence of: req.session.user
                var image = '/img/logos/small/user.png'
                if (user.gravatar) {
                    image = gravatar.url(user.email, {s:25, r:'g', d: 'mm'}, {protocol: 'https'});
                } else if (user.image !== 'default') {
                    image = '/img/users/' + user.image
                }
                
                // Create session
                req.session.user = {id:user.id, username:user.username, email: user.email, image: image};

                // If user is admin add parameter to session
                if (user.admin) {
                    req.session.user.admin = user.admin
                }

                res.redirect('/idm');
            });
        } else { // If error exists send a message to /auth/login
            req.session.errors = errors;
            res.redirect("/auth/login");  
        }
    
};

// DELETE /auth/logout -- Delete Session
exports.destroy = function(req, res) {

    debug("--> destroy");

    delete req.session.application;
    delete req.session.user;
    res.redirect('/'); 
};
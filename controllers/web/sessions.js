var gravatar = require('gravatar');
var debug = require('debug')('idm:web-session_controller')

var models = require('../../models/models.js');
var userController = require('./users');

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

// MW to perform actions forgot password and re send confirmation of registration
exports.login_not_required = function(req, res, next){

    debug("--> login_required");

    if (req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
};

// MW to see if user needs to change password
exports.password_check_date = function(req, res, next) {

    var today = new Date((new Date()).getTime())
    var millisecondsPerDay = 24 * 60 * 60 * 1000;

    //var d = new Date("January 6, 2017 11:13:00");

    var days_since_change = Math.round((today - req.session.user.change_password)/millisecondsPerDay); 

    if (days_since_change > 365) {
        req.session.change_password = true
        res.redirect('/update_password')          
    } else {
        next();
    }
}

// GET /auth/login -- Form for login
exports.new = function(req, res) {

    debug("--> new");

    var errors = req.session.errors || {};
    delete req.session.errors;
    if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message
    }
    res.render('index', {errors: errors, csrfToken: req.csrfToken()});
};

// POST /auth/login -- Create Session
exports.create = function(req, res, next) {

    debug("--> create");

    // If inputs email or password are empty create an array of errors
    errors = []
    if (!req.body.email) {
        errors.push({message: 'email'});
    }
    if (!req.body.password) {
        errors.push({message: 'password'});
    }

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
                req.session.user = {id:user.id, username:user.username, email: user.email, image: image, change_password: user.date_password};

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

// GET /update_password -- Render settings/password view with a warn to indicate user to change password
exports.update_password = function(req, res) {
    res.render('settings/password', {errors: [], warn_change_password: true, csrfToken: req.csrfToken()})
}

// DELETE /auth/logout -- Delete Session
exports.destroy = function(req, res) {

    debug("--> destroy");

    delete req.session.user;
    res.redirect('/'); 
};
var models = require('../models/models.js');

// MW to authorized restricted http accesses
exports.loginRequired = function(req, res, next){
    if (req.session.user) {
        next();
    } else {
        req.session.errors = [{message: 'sessionExpired'}];
        res.redirect('/auth/login');
    }
};

// GET /auth/login -- Form for login
exports.new = function(req, res) {
    var errors = req.session.errors || {};
    delete req.session.errors;
    console.log(errors)
    if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message
    }
    res.render('index', {errors: errors});
};

// POST /auth/login -- Create Session
exports.create = function(req, res) {

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
                req.session.user = {id:user.id, username:user.username, email: user.email};
                res.redirect('/idm');
            });
        } else { // If error exists send a message to /auth/login
            req.session.errors = errors;
            res.redirect("/auth/login");  
        }
    
};

// DELETE /auth/logout -- Delete Session
exports.destroy = function(req, res) {
    delete req.session.application;
    delete req.session.user;
    res.redirect('/'); 
};
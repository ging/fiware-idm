var models = require('../models/models.js');
var mailer = require('../lib/mailer').mailer();
var config = require('../config');
var ejs = require('ejs');

// MW to load info about a user
exports.loadUser = function(req, res, next, userId) {

    // Search user whose id is userId
    models.user.findOne({
        where: {id: userId},
        attributes: ['id', 'username', 'email', 'description', 'website', 'image']
    }).then(function(user) {
        // If user exists, set image from file system
        if (user) {
            req.user = user
            if (user.image == 'default') {
                req.user.image = '/img/logos/original/user.png'
            } else {
                req.user.image = '/img/users/'+user.image
            }
            // Send request to next function
            next();
        } else { next(new Error("The user with id " + userId + " doesn't exist"));}
    }).catch(function(error) { next(error); });
}

// MW to see if user can do some actions
exports.owned_permissions = function(req, res, next) {
    if (req.session.user.id === req.user.id) {
        next();
    } else {
        res.redirect('/')
    }
}

// GET /idm/users/:userId -- Show info about a user
exports.show = function(req, res) {
    // See if user to show is equal to user logged
    if (req.session.user.id === req.user.id) {
        req.user['auth'] = true;
    }
    if (req.session.message) {
        res.locals.message = req.session.message
        delete req.session.message  
    }
    res.render('users/show', {user: req.user})
}

// GET /idm/users/:userId/edit -- Render a form to edit user profile
exports.edit = function(req, res) {
    res.render('users/edit', {user: req.user, errors: []})
}

// PUT /idm/users/:userId/edit/info -- Update user info
exports.update_info = function(req, res) {
    // Build a row and validate if input values are correct (not empty) before saving values in user table
    req.body.user['id'] = req.session.user.id;
    var user = models.oauth_client.build(req.body.user);

    user.validate().then(function(err) {
        models.user.update(
            { username: req.body.user.username,
              description: req.body.user.description,
              website: req.body.user.website },
            {
                fields: ['username','description','website'],
                where: {id: req.session.user.id}
            }
        ).then(function() {
            // Send message of success of updating user
            req.session.message = {text: ' User updated successfully.', type: 'success'};
            res.redirect('/idm/users/'+req.session.user.id);
        }).catch(function(error){ 
            // Send message of warning of updating user
            res.locals.message = {text: ' User update failed.', type: 'warning'};
            if (req.user.image == 'default') {
                req.user.image = '/img/logos/original/user.png'
            } else {
                req.user.image = '/img/users/'+req.user.image
            }
            res.render('users/edit', { user: req.body.user, errors: error.errors});
        });
    }).catch(function(error){ 

        // Send message of warning of updating user
        res.locals.message = {text: ' User update failed.', type: 'warning'};
        if (req.user.image == 'default') {
            req.user.image = '/img/logos/original/user.png'
        } else {
            req.user.image = '/img/users/'+req.user.image
        }
        res.render('users/edit', { user: req.body.user, errors: error.errors});
    });
}

// GET /idm/users/:userId/edit -- Render a form to edit user profile
exports.edit = function(req, res) {
    res.render('users/edit', {user: req.user, errors: []})
}

// PUT /idm/users/:userId/edit/avatar -- Update user avatar
exports.update_avatar = function(req, res) {
    console.log("------------------------")
}


// MW to see if user is registered
exports.authenticate = function(email, password, callback) {

    // Search the user through the email
    models.user.find({
        where: {
            email: email
        }
    }).then(function(user) {
        if (user) {
            // Verify password and if user is enabled to use the web
            if(user.verifyPassword(password) && user.enabled){
                callback(null, user);
            } else { callback(new Error('invalid')); }   
        } else { callback(new Error('invalid')); }
    }).catch(function(error){ callback(error) });
};

// GET /sign_up -- View to create a new user
exports.new = function(req, res) {
    res.render('users/new', {userInfo: {}, errors: []});
};

// POST /sign_up -- Create new user
exports.create = function(req, res, next) {

    // Array of errors to send to the view
    errors = [];

    // Build a row and validate it
    var user = models.user.build({
        username: req.body.username, 
        email: req.body.email, 
        password: req.body.password1,
        enabled: false,
        activation_key: Math.random().toString(36).substr(2),
        activation_expires: new Date((new Date()).getTime() + 1000*3600*24)     // 1 day
    });

    // If password(again) is empty push an error into the array
    if (req.body.password2 == "") {
        errors.push({message: "password2"});
    }
    user.validate().then(function(err) {

        // If the two password are differents, send an error
        if (req.body.password1 != req.body.password2) {
            errors.push({message: "passwordDifferent"});
            throw new Error("passwordDifferent");
        } else {

            // Save the row in the database
            user.save().then(function() {
                
                // Send an email to the user
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

    // If validation fails, send an array with all errors found
    }).catch(function(error){ 
        if (error.message != "passwordDifferent") {
            errors = errors.concat(error.errors);
        }
        res.render('users/new', { userInfo: user, errors: errors}); 
    });
};

// GET /activate -- Activate user
exports.activate = function(req, res, next) {

    // Search the user through the id
    models.user.find({
        where: {
            id: req.query.user
        }
    }).then(function(user) {
        if (user) {

            // Activate the user if is not or if the actual date not exceeds the expiration date
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
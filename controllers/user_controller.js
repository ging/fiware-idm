var models = require('../models/models.js');

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
                // TODO (aalonsog) send mail
                console.log('USER CREATED. ACTIVATION LINK: http://localhost:3000/activate?activation_key=' + 
                    user.activation_key + '&user=' + user.id);
                // res.infoMessage = {mess: 'Account created succesfully, check your email for the confirmation link.', type: 'success'};

                
                res.redirect('/');
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
            console.log('Activation key', user.activation_key);
            console.log('Activation key in url', req.query.activation_key);
            if (user.enabled) {
                // user already enabled
                res.redirect('/'); 
            } else if (user.activation_key === req.query.activation_key) {
                if ((new Date()).getTime() > user.activation_expires.getTime()) {
                    // error activating user (expired)
                    res.redirect('/'); 
                } else {
                    user.enabled = true;
                    user.save().then(function() {
                        // success
                        res.redirect('/');
                    }); 
                }
            };
        } else {
            // error activating user
            res.redirect('/'); 
        }
        

    }).catch(function(error){ callback(error) });
}
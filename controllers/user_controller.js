var models = require('../models/models.js');

// See if user is registered
exports.authenticate = function(email, password, callback) {
    models.User.find({
        where: {
            email: email
        }
    }).then(function(user) {
        if (user) {
            if(user.verifyPassword(password)){
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
    var user = models.User.build({username: req.body.username, email: req.body.email, password: req.body.password1});
    if (req.body.password2 == "") {
        errors.push({message: "password2"});
    }
    user.validate().then(function(err) {
        if (req.body.password1 != req.body.password2) {
            errors.push({message: "passwordDifferent"});
            throw new Error("passwordDifferent");
        } else {
            user.save({fields: ["username", "email", "password"]}).then(function() {
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
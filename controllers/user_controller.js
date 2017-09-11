var models = require('../models/models.js');

// See if user is registered
exports.authenticate = function(username, password, callback) {
    models.User.find({
        where: {
            username: username
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
    // var user = models.User.build(req.body.application);
    // application.validate().then(function(err) {
    //     application.save({fields: ["name", "description", "applicationId", "applicationSecret"]}).then(function() {
    //         res.redirect('/applications');
    //     }); 
    // }).catch(function(error){ 
    //     res.render('applications/new', { applicationInfo: application, errors: error.errors}); 
    // });
};
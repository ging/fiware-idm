var models = require('../models/models.js');

// See if user is registered
exports.autenticar = function(username, password, callback) {
    models.User.find({
        where: {
            username: username
        }
        }).then(function(user) {
            if (user) {
                if(user.verifyPassword(password)){
                    callback(null, user);
                }
                else { callback(new Error({'message': 'invalid'}); }   
            } else { callback(new Error({'message': 'invalid'}); }
    }).catch(function(error){callback(error)});
};
var models = require('../models/models.js');
var config = require('../config');
var crypto = require('crypto');
var external_auth = config.external_auth;
var key = config.external_auth.password_encryption_key;

var debug = require('debug')('idm:external_auth');

// MW to see if user is registered
exports.authenticate = function(username, password, callback) {

    debug("--> authenticating external user")
    // Search the user
    models.user_ext.find({
        attributes: ['id', 'username', 'email', 'password', 'password_salt'],
        where: {
            email: username
        }
    }).then(function(user) {
        debug("--> user found", user.username)
        if (user) {
            // Verify password
            if(user.verifyPassword(password)) {
                findLocalUser(user, function(localUser) {
                    callback(null, localUser);
                });
            } else { callback(new Error('invalid')); }
        } else { callback(new Error('user_not_found')); }
    }).catch(function(error){ callback(error) });
};

function findLocalUser(user, callback) {
    debug("--> searching local user with id: ", external_auth.id_prefix + user.id);
    models.user.find({
        attributes: ['id', 'username', 'salt', 'password', 'enabled', 'email', 'gravatar', 'image', 'admin', 'date_password', 'starters_tour_ended'],
        where: {
            id: external_auth.id_prefix + user.id
        }
    }).then(function(localUser) {
        if (localUser) {
            debug("--> local user already exists", localUser);
            callback(localUser);
        } else {
            debug("--> local user does not exist, creating it");
            createLocalUser(user, function (localUser) {
                debug("--> local user created");
                callback(localUser);
            });
        }
    }).catch(function(error){ callback(error) });
}

function createLocalUser (user, callback) {
    debug("--> creating local user");

    // TODO: update user values if changed in external database

    // Build a row and validate it
    var localUser = models.user.build({
        id: external_auth.id_prefix + user.id,
        username: user.username,
        email: user.email,
        password: 'none',
        date_password: new Date((new Date()).getTime()),
        enabled: true
    });

    localUser.validate().then(function(err) {

        // Save the row in the database
        localUser.save().then(function() {
            callback(localUser);
        });
    // If validation fails, send an array with all errors found
    }).catch(function(error){
        debug("--> error creating local user", error);
        callback(error);
    });
}

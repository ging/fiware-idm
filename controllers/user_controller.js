var models = require('../models/models.js');
var config = require('../config');
var fs = require('fs');
var gravatar = require('gravatar');
var https = require('https');

var mmm = require('mmmagic'),
    Magic = mmm.Magic;

var magic = new Magic(mmm.MAGIC_MIME_TYPE);

var debug = require('debug')('idm:user_controller')
var Jimp = require("jimp");

var email = require('../lib/email.js')

// MW to see if user can do some actions
exports.owned_permissions = function(req, res, next) {

    debug("--> owned_permissions");

    if (req.session.user.id === req.user.id) {
        next();
    } else {
        res.redirect('/');
    }
}

// MW to load info about a user
exports.load_user = function(req, res, next, userId) {

    debug("--> load_user");

    // Search user whose id is userId
    models.user.findOne({
        where: {id: userId},
        attributes: ['id', 'username', 'email', 'description', 'website', 'image', 'gravatar']
    }).then(function(user) {
        // If user exists, set image from file system
        if (user) {
            req.user = user
            // Send request to next function
            next();
        } else { 
            req.session.message = {text: ' User doesn`t exist.', type: 'danger'};
            res.redirect('/')
        }
    }).catch(function(error) { next(error); });
}

// GET /idm/users/:userId -- Show info about a user
exports.show = function(req, res, next) {

    debug("--> show")

    // Find user applications
    models.role_user.findAll({
        where: {user_id: req.user.id},
        include: [{
            model: models.oauth_client,
            attributes: ['id', 'name', 'url', 'image']
        }]
    }).then(function(user_applications) {
        // See if user to show is equal to user logged
        if (req.session.user.id === req.user.id) {
            req.user['auth'] = true;
        }
        if (req.session.message) {
            res.locals.message = req.session.message
            delete req.session.message  
        }

        if (req.user.gravatar) {
            req.user.image = gravatar.url(req.user.email, {s:100, r:'g', d: 'mm'}, {protocol: 'https'});
        } else if (req.user.image == 'default') {
            req.user.image = '/img/logos/original/user.png'
        } else {
            req.user.image = '/img/users/' + req.user.image
        }

        var applications = []

        // If user has applications, set image from file system and obtain info from each application
        if (user_applications.length > 0) {
        
            user_applications.forEach(function(app) {
                if (applications.length == 0 || !applications.some(elem => (elem.id == app.OauthClient.id))) {
                    if (app.OauthClient.image == 'default') {
                        app.OauthClient.image = '/img/logos/medium/app.png'
                    } else {
                        app.OauthClient.image = '/img/applications/'+app.OauthClient.image
                    }
                    applications.push(app.OauthClient)
                } 
            });

            // Order applications and render view
            applications.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} )
        }

        res.render('users/show', {user: req.user, applications: applications, csrfToken: req.csrfToken()})
    }).catch(function(error) {
         next(error);
    });
}

// GET /idm/users/:userId/edit -- Render a form to edit user profile
exports.edit = function(req, res) {

    debug("--> edit")

    // If message exists in session, copy to locals and delete from session
    if (req.session.message) {
        res.locals.message = req.session.message
        delete req.session.message  
    }

    // Set image path
    if (req.user.image == 'default') {
        req.user.image = '/img/logos/original/user.png'
    } else {
        req.user.image = '/img/users/' + req.user.image
    }

    if (!req.user.gravatar) {
        var url = gravatar.url(req.session.user.email, {s:100, r:'g', d: 404}, {protocol: 'https'});

        // Send an http request to gravatar
        https.get(url, function(response) {
            response.setEncoding('utf-8');
            debug('  --> Request to gravatar status: ' + response.statusCode)
            
            // If exists set parameter in req.user
            if (response.statusCode === 200) {
                req.user['image_gravatar'] = url
            }

            res.render('users/edit', {user: req.user, error: [], csrfToken: req.csrfToken()});

        }).on('error', function(e) {
            debug('Failed connecting to gravatar: ' + e);
            res.render('users/edit', {user: req.user, error: [], csrfToken: req.csrfToken()});
        });
    } else {
        req.user.image_gravatar = gravatar.url(req.session.user.email, {s:100, r:'g', d: 404}, {protocol: 'https'});
        res.render('users/edit', {user: req.user, error: [], csrfToken: req.csrfToken()});
    }
}

// PUT /idm/users/:userId/edit/info -- Update user info
exports.update_info = function(req, res) {

    debug("--> update_info")

    // Build a row and validate if input values are correct (not empty) before saving values in user table
    req.body.user['id'] = req.session.user.id;
    var user = models.user.build(req.body.user);

    if (req.body.user.description.replace(/^\s+/, '').replace(/\s+$/, '') === '') {
        req.body.user.description = null
    }

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
            debug('Error updating values of organization ' + error)
            req.session.message = {text: ' Fail update user.', type: 'danger'};
            res.redirect('/idm/users/'+req.session.user.id);
        })
    }).catch(function(error){ 

        // Send message of warning of updating user
        res.locals.message = {text: ' User update failed.', type: 'warning'};


        if (req.user.gravatar) {
            req.body.gravatar = true
            req.body.user.image_gravatar = gravatar.url(req.user.email, {s:100, r:'g', d: 'mm'}, {protocol: 'https'});
        }
        if (req.user.image == 'default') {
            req.body.user.image = '/img/logos/original/user.png'
        } else {
            req.body.user.image = '/img/users/' + req.user.image
        }
        res.render('users/edit', { user: req.body.user, error: error, csrfToken: req.csrfToken()});
    });
}

// PUT /idm/users/:userId/edit/avatar -- Update user avatar
exports.update_avatar = function(req, res) {

    debug("--> update_avatar")

    // See if the user has selected a image to upload
    if (req.file) {
        handle_uploaded_images(req, res, '/idm/users/'+req.session.user.id)

    // If not send error message
    } else {
        req.session.message = {text: ' fail uploading image.', type: 'warning'};
        res.redirect('/idm/users/'+req.user.id);
    } 
}

// DELETE /idm/users/:userId/edit/delete_avatar -- Delete user avatar
exports.delete_avatar = function(req, res) {

    debug("--> delete_avatar")

    // Change image to default one in user table
    models.user.findById(req.session.user.id).then(function(user) {
        if (user) {
            models.user.update(
                { image: 'default' },
                {
                    fields: ["image"],
                    where: {id: req.session.user.id }
                }
            ).then(function(){
                fs.unlink('./public/img/users/'+user.image, (err) => {
                    if (err) {
                        // Send message of fail when deleting image
                        req.session.message = {text: ' Failed to delete image.', type: 'warning'};
                        res.redirect('/idm/users/'+req.user.id+'/edit');
                    } else {
                        // Send message of success in deleting image
                        if (req.user.gravatar) {
                            req.session.user.image = gravatar.url(req.session.user.email, {s:25, r:'g', d: 'mm'}, {protocol: 'https'});
                        } else {
                            req.session.user.image = '/img/logos/small/user.png'                            
                        }
                        req.session.message = {text: ' Deleted image.', type: 'success'}
                        res.redirect('/idm/users/'+req.user.id+'/edit'); 
                    }
                });
            }).catch(function(error) {
                // Send message of fail when deleting image
                req.session.message = {text: ' Failed to delete image.', type: 'warning'}
                res.redirect('/idm/users/'+req.user.id+'/edit'); 
            });
        } else {
            // Send message of fail when deleting image
            req.session.message = {text: ' user not found.', type: 'warning'}
            res.redirect('/');    
        }
    }).catch(function(error) {
        // Send message of fail when deleting image
        req.session.message = {text: ' Error searching user.', type: 'warning'}
        res.redirect('/'); 
    });
}

// PUT /idm/users/:userId/edit/avatar/set -- Use avatar as profile image
exports.set_avatar = function(req, res) {

    debug("--> set_avatar")

    models.user.update(
        { gravatar: false },
        {
            fields: ['gravatar'],
            where: {id: req.session.user.id}
        }
    ).then(function() {
        // Send message of success when updating image 
        if (req.user.image == 'default') {
            req.session.user.image = '/img/logos/small/user.png'
        } else {
            req.session.user.image = '/img/users/' + req.user.image
        }
        req.session.message = {text: ' set avatar.', type: 'success'};
        res.redirect('/idm/users/'+req.user.id);
    }).catch(function(error) { 
        // Send message of fail when updating image
        res.locals.message = {text: ' set avatar failed.', type: 'warning'};
        res.render('users/edit', { user: req.user, error: error, csrfToken: req.csrfToken()});
    });
}


// PUT /idm/users/:userId/edit/gravatar -- Use gravatar as profile image
exports.set_gravatar = function(req, res) {

    debug("--> set_gravatar")

    models.user.update(
        { gravatar: true },
        {
            fields: ['gravatar'],
            where: {id: req.session.user.id}
        }
    ).then(function() {
        // Send message of success when updating image 
        var url = gravatar.url(req.session.user.email, {s:25, r:'g', d: 'mm'}, {protocol: 'https'});
        req.session.user.image = url;
        req.session.message = {text: ' set gravatar.', type: 'success'};
        res.redirect('/idm/users/'+req.user.id);
    }).catch(function(error){ 
        // Send message of fail when updating image
        res.locals.message = {text: ' set gravatar failed.', type: 'warning'};
        res.render('users/edit', { user: req.user, error: error, csrfToken: req.csrfToken()});
    });
}

// MW to see if user is registered
exports.authenticate = function(email, password, callback) {

    debug("--> authenticate")

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

    debug("--> new")

    res.render('users/new', {userInfo: {}, errors: [], csrfToken: req.csrfToken()});
};

// POST /sign_up -- Create new user
exports.create = function(req, res, next) {

    debug("--> create")

    // If body has parameters id or secret don't create user
    if (req.body.id) {
        res.locals.message = {text: ' User creation failed.', type: 'danger'};
        res.render('users/new', {userInfo: {}, errors: [], csrfToken: req.csrfToken()});
    } else {
        // Array of errors to send to the view
        errors = [];

        // Build a row and validate it
        var user = models.user.build({
            username: req.body.username, 
            email: req.body.email,
            password: req.body.password1,
            date_password: new Date((new Date()).getTime()),
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
            if (req.body.password1 !== req.body.password2) {
                errors.push({message: "passwordDifferent"});
                throw new Error("passwordDifferent");
            } else {

                // Save the row in the database
                user.save().then(function() {

                    if (req.body.use_gravatar) {
                        var url = gravatar.url(user.email, {s:100, r:'g', d: 404}, {protocol: 'https'});

                        // Send an http request to gravatar
                        https.get(url, function(response) {
                            response.setEncoding('utf-8');
                            debug('  --> Request to gravatar status: ' + response.statusCode)
                            
                            // If exists set parameter in req.user
                            if (response.statusCode === 200) {
                                models.user.update(
                                    { gravatar: true },
                                    {
                                        fields: ['gravatar'],
                                        where: {id: user.id}
                                    }
                                ).then(function() {
                                    debug('  --> Gravatar set')
                                }).catch(function(error) {
                                    debug('  -> error' + error)
                                })
                            }
                        }).on('error', function(e) {
                            debug('Failed connecting to gravatar: ' + e);
                        });
                    }

                    
                    // Send an email to the user
                    var link = config.host + '/activate?activation_key=' + user.activation_key + '&email=' + user.email;

                    var mail_data = {
                        name: user.username,
                        link: link
                    };

                    var subject = 'Welcome to FIWARE';

                    // Send an email message to the user
                    email.send('activate', subject, user.email, mail_data)

                    res.locals.message = {text: 'Account created succesfully, check your email for the confirmation link.', type: 'success'};
                    res.render('index', { errors: [], csrfToken: req.csrfToken() });
                }); 
            }

        // If validation fails, send an array with all errors found
        }).catch(function(error){ 
            if (error.message != "passwordDifferent") {
                errors = errors.concat(error.errors);
            }
            res.render('users/new', { userInfo: user, errors: errors, csrfToken: req.csrfToken()}); 
        });
    }
};

// GET /activate -- Activate user
exports.activate = function(req, res, next) {

    debug("--> activate")

    // Search the user through the id
    models.user.find({
        where: {
            email: req.query.email
        }
    }).then(function(user) {
        if (user) {

            // Activate the user if is not or if the actual date not exceeds the expiration date
            if (user.enabled) {
                res.locals.message = {text: 'User already activated', type: 'warning'};
                res.render('index', { errors: [], csrfToken: req.csrfToken() });
            } else if (user.activation_key === req.query.activation_key) {
                if ((new Date()).getTime() > user.activation_expires.getTime()) {
                    res.locals.message = {text: 'Error activating user', type: 'danger'};
                    res.render('index', { errors: [], csrfToken: req.csrfToken() });
                } else {
                    user.enabled = true;
                    user.save().then(function() {
                        res.locals.message = {text: 'User activated. login using your credentials.', type: 'success'};
                        res.render('index', { errors: [], csrfToken: req.csrfToken() });
                    }); 
                }
            };
        } else {
            res.locals.message = {text: 'Error activating user', type: 'danger'};
            res.render('index', { errors: [], csrfToken: req.csrfToken() });
        }
        

    }).catch(function(error){ callback(error) });
}

// GET /password/request -- Render a view with instructions to reset password
exports.password_request = function(req, res, next) {

    debug("--> password_request")

    res.render('auth/password_request', {error: '', csrfToken: req.csrfToken() })

}

// POST /password/request -- Send an email with instructions to reset password
exports.password_send_email = function(req, res, callback) {

    debug("--> password_send_email")

    if (!req.body.email) {
        res.render('auth/password_request', {error: 'empty_field', csrfToken: req.csrfToken()})
    } else {
        models.user.findOne({
            where: { email: req.body.email}
        }).then(function(user) {
            
            if (!user) {
                res.locals.message = {  text: `Sorry. You have specified an email address that is not registered. 
                                               If your problem persists, please contact: fiware-lab-help@lists.fiware.org`, 
                                        type: 'danger'}
                res.render('auth/password_request', {error: '', csrfToken: req.csrfToken()})

            } else if (!user.enabled) {
                res.locals.message = {  text: `The email address you have specified is registered but not activated. 
                                               Please check your email for the activation link or request a new one.
                                               If your problem persists, please contact: fiware-lab-help@lists.fiware.org`, 
                                        type: 'danger'}
                res.render('auth/password_request', {error: '', csrfToken: req.csrfToken()})

            } else {
                var reset_key = Math.random().toString(36).substr(2);
                var reset_expires = new Date((new Date()).getTime() + 1000*3600*24)

                models.user.update(
                    { reset_key: reset_key,
                      reset_expires: reset_expires 
                }, {
                    fields: ['reset_key', 'reset_expires'],
                    where: { id: user.id}
                }).then(function() {
                    
                    // Send an email to the user
                    var link = config.host + '/password/reset?reset_key=' + reset_key + '&email=' + user.email;

                    var mail_data = {
                        name: user.username,
                        link: link
                    };

                    var subject = 'Reset password instructions';

                    // Send an email message to the user
                    email.send('forgot_password', subject, user.email, mail_data)

                    req.session.message = {text: 'Reset password instructions send to ' + user.email, type: 'success'};
                    res.redirect('/auth/login');
                }).catch(function(error) {
                    debug('  -> error' + error)
                    res.redirect('/')
                })                
            }
        }).catch(function(error) {
            debug('  -> error' + error)
            res.redirect('/')
        })
    }
}

// GET /password/reset -- Render a view to change password
exports.new_password = function(req, res, next) {

    debug("--> new_password")

    res.render('auth/password_reset', { key: req.query.reset_key, email: req.query.email, errors: [], csrfToken: req.csrfToken() })
}

// POST /password/reset -- Set new password in database
exports.change_password = function(req, res, next) {

    debug("--> change_password")

    var errors = []

    // If password new is empty push an error into the array
    if (req.body.password1 == "") {
        errors.push("password");
    }

    // If password(again) is empty push an error into the array
    if (req.body.password2 == "") {
        errors.push("confirm_password");
    }

    // If the two password are differents, send an error
    if (req.body.password1 !== req.body.password2) {
        errors.push("password_different");
    }

    // Search the user through the email
    models.user.find({
        where: {
            email: req.query.email
        }
    }).then(function(user) {
        if (user) {
            if (user.reset_key === req.query.reset_key) {
                if ((new Date()).getTime() > user.reset_expires.getTime()) {
                    res.locals.message = {text: 'Error reseting user password', type: 'danger'};
                    res.render('index', { errors: [], csrfToken: req.csrfToken() });
                } else if (errors.length > 0) {
                    res.render('auth/password_reset', { key: req.query.reset_key, email: req.query.email, errors: errors, csrfToken: req.csrfToken() })
                } else {
                    models.user.update({ 
                        password: req.body.password1,
                        date_password: new Date((new Date()).getTime())
                    },{
                        fields: ['password', 'date_password'],
                        where: { email: user.email}
                    }).then(function() {
                        req.session.message = { text: ' Password successfully changed', type: 'success'}
                        res.redirect('/auth/login')
                    }).catch(function(error) {
                        debug('  -> error' + error)
                        res.redirect('/auth/login')
                    })   
                }
            };
        } else {
            res.locals.message = {text: 'Error reseting user password', type: 'danger'};
            res.render('index', { errors: [], csrfToken: req.csrfToken() });
        }
    }).catch(function(error){ debug(error) });   
}

// GET /confirmation -- Render a view with instructions to resend confirmation
exports.confirmation = function(req, res, next) {

    debug("--> confirmation")

    res.render('auth/confirmation', {error: '', csrfToken: req.csrfToken() })

}

// POST /confirmation -- Send a new message of activation to the user
exports.resend_confirmation = function(req, res, next) {

    debug("--> resend_confirmation")

    if (!req.body.email) {
        res.render('auth/confirmation', {error: 'empty_field', csrfToken: req.csrfToken()})
    } else {
        models.user.findOne({
            where: { email: req.body.email}
        }).then(function(user) {
            if (user) {

                if (user.enabled) {
                    res.locals.message = {text: ' User was already activated, please try signing in', type: 'danger'};
                    res.render('auth/confirmation', {error: '', csrfToken: req.csrfToken() });
                } else {
                    var activation_key = Math.random().toString(36).substr(2);
                    var activation_expires = new Date((new Date()).getTime() + 1000*3600*24)

                    models.user.update(
                        { activation_key: activation_key,
                          activation_expires: activation_expires 
                    }, {
                        fields: ['activation_key', 'activation_expires'],
                        where: { id: user.id}
                    }).then(function(updated) {

                        // Send an email to the user
                        var link = config.host + '/activate?activation_key=' + activation_key + '&email=' + user.email;

                        var mail_data = {
                            name: user.username,
                            link: link
                        };

                        var subject = 'Welcome to FIWARE';

                        // Send an email message to the user
                        email.send('activate', subject, user.email, mail_data)

                        req.session.message = {text: 'Resend confirmation instructions email to ' + user.email, type: 'success'};
                        res.redirect('/auth/login');
                    }).catch(function(error) {
                        debug('  -> error' + error)
                        callback(error)
                    })
                }
            } else {
                res.locals.message = {  text: `Sorry. You have specified an email address that is not registerd. 
                                               If your problem persists, please contact: fiware-lab-help@lists.fiware.org`, 
                                        type: 'danger'}
                res.render('auth/confirmation', {error: '', csrfToken: req.csrfToken()})
            }
        }).catch(function(error) {
            debug('  -> error' + error)
            res.redirect('/')
        })
    }

}


// Function to check and crop an image and to update the name in the user table
function handle_uploaded_images(req, res, redirect_uri) {

    // Check the MIME of the file upload
    var types = ['jpg', 'jpeg', 'png']
    magic.detectFile('public/img/users/'+req.file.filename, function(err, result) {
        if (err) {
            req.session.message = {text: ' Image not save.', type: 'warning'};
            return res.redirect(redirect_uri);
        }

        if (result && types.includes(String(result.split('/')[1]))) {
                // If the file is jpg, png or jpeg, update the user with the name of the image
                Jimp.read('public/img/users/'+req.file.filename, function(err, image) {
                    // If error reading image redirect to show view
                    if (err) {
                        req.session.message = {text: ' Image not cropped.', type: 'warning'};
                        return res.redirect(redirect_uri);
                    }
                    
                    image.crop(Number(req.body.x), Number(req.body.y), Number(req.body.w), Number(req.body.h))
                         .write('public/img/users/'+req.file.filename)

                    models.user.update(
                        { image: req.file.filename },
                        {
                            fields: ['image'],
                            where: {id: req.session.user.id}
                        }
                    ).then(function() {
                        // Old image to be deleted
                        var old_image = req.user.image
                        if (old_image.includes('/img/users/')) {
                            // If error deleting old image redirect to show view
                            fs.unlink('./public/img/users/'+old_image, (err) => {
                                if (err) {
                                    req.session.message = {text: ' Error saving image.', type: 'danger'};
                                    res.redirect(redirect_uri);
                                } else {
                                    // Send message of success when updating image
                                    req.session.user.image = '/img/users/' + req.file.filename
                                    req.session.message = {text: ' Image updated successfully.', type: 'success'};
                                    res.redirect(redirect_uri);
                                }
                            });
                        } else {
                            // Send message of success when updating image                           
                            req.session.user.image = '/img/users/' + req.file.filename
                            req.session.message = {text: ' Image updated successfully.', type: 'success'};
                            res.redirect(redirect_uri);
                        }
                    }).catch(function(error){ 
                        // Send message of fail when updating image
                        res.session.message = {text: ' User image update failed.', type: 'warning'};
                        res.redirect(redirect_uri);
                    });          
                })
        // If not, the default image is assigned to the user
        } else {
            fs.unlink('./public/img/users/'+req.file.filename, (err) => {
                req.session.message = {text: ' Inavalid file.', type: 'danger'};
                res.redirect(redirect_uri);            
            });
        }
    });
}


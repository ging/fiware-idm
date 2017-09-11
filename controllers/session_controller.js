var models = require('../models/models.js');

// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next){
    if (req.session.user) {
        next();
    } else {
        req.session.errors = [{message: 'sessionExpired'}];
        res.redirect('/auth/login');
    }
};

// Form for login
exports.new = function(req, res) {
    console.log(req.session.errors)
    var errors = req.session.errors || {};
    req.session.errors = {};
    res.render('index', {errors: errors});
};

// Create Session
exports.create = function(req, res) {

    errors = []
    if (!req.body.login) {
        errors.push({message: 'username'});
    }
    if (!req.body.password) {
        errors.push({message: 'password'});
    }

    var userController = require('./user_controller');

        if (req.body.login && req.body.password) {
            userController.autenticar(req.body.login, req.body.password, function(error, user) {
                if (error) {  // si hay error retornamos mensajes de error de sesión
                    req.session.errors = [{message: error.message}];
                    res.redirect("/auth/login");        
                    return;
                }

                // Crear req.session.user y guardar campos   id  y  username
                // La sesión se define por la existencia de:    req.session.user
                req.session.user = {id:user.id, username:user.username};
                res.redirect('/applications');
            });
        } else {
            req.session.errors = errors;
            res.redirect("/auth/login");  
        }
    
};

// Delete Session
exports.destroy = function(req, res) {
    delete req.session.user;
    res.redirect('/'); 
};
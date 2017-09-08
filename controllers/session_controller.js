var models = require('../models/models.js');

// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next){
    if (req.session.user) {
        next();
    } else {
        req.session.errors = [{message: 'sessionExpired'}];
        res.redirect('/login');
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

    var user = models.User.build(req.body.user);
    // req.user.username  = req.body.user.username;
    // req.user.password  = req.body.user.password;

    var userController = require('./user_controller');

    user.validate().then(function(user){
        userController.autenticar(req.body.userusername, req.body.user.password, function(error, user) {
            console.log("Autenticando")
            if (error) {  // si hay error retornamos mensajes de error de sesión
                console.log(error)
                req.session.errors = [{message: error[0]}];
                res.redirect("/login");        
                return;
            }

            // Crear req.session.user y guardar campos   id  y  username
            // La sesión se define por la existencia de:    req.session.user
            req.session.user = {id:user.id, username:user.username};
            res.redirect('applications');
        });
    }).catch(function(error){ 
        console.log(error.errors)
        req.session.errors = error.errors;
        res.redirect("/login");  
    });
    
};

// Delete Session
exports.destroy = function(req, res) {
    delete req.session.user;
    res.redirect('/'); 
};
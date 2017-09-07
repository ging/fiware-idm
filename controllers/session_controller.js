var models = require('../models/models.js');

// Form for login
exports.new = function(req, res) {
    var errors = req.session.errors || {};
    req.session.errors = {};

    res.render('index', {errors: errors});
};

// Create Session
exports.create = function(req, res) {

    var login     = req.body.login;
    var password  = req.body.password;

    console.log("Pasas pr aqui")
    var userController = require('./user_controller');
    userController.autenticar(login, password, function(error, user) {
        if (error) {  // si hay error retornamos mensajes de error de sesión
            req.session.errors = [{"message": 'Se ha producido un error: '+error}];
            res.redirect("/login");        
            return;
        }

        // Crear req.session.user y guardar campos   id  y  username
        // La sesión se define por la existencia de:    req.session.user
        req.session.user = {id:user.id, username:user.username, isAdmin:user.isAdmin};
        res.redirect('applications');
    });
};

// Delete Session
exports.destroy = function(req, res) {
    delete req.session.user;
    res.redirect(req.session.redir.toString()); // redirect a path anterior a login
};
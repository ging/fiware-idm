var express = require('express');
var multer  = require('multer');
var router = express.Router();

// Create controllers
var applicationController = require('../controllers/application_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var homeController = require('../controllers/home_controller');
var oauthController = require('../controllers/oauth_controller');

// MW to see if query has delete method
router.use( function( req, res, next ) {
    // this middleware will call for each requested
    // and we checked for the requested query properties
    // if _method was existed
    // then we know, clients need to call DELETE request instead
    if ( req.query._method == 'DELETE' ) {
        // change the original METHOD
        // into DELETE method
        req.method = 'DELETE';
        // and set requested url to /user/12
        req.url = req.path;
    }       
    next(); 
});


// GET Home PAge
router.get('/', function(req, res, next) {
	if (req.session.user) {
        res.redirect('/idm')
    } else {
    	res.render('index', { errors: [] });
    }
});


var oauthServer = require('oauth2-server');
// Create Oauth Server model
router.oauth = new oauthServer({
  model: require('../models/model_oauth_server.js'),
  debug: true
});

// Routes for Oauth2
router.get('/auth/token',       oauthController.authenticate());
router.post('/oauth2/token',    oauthController.token);
router.get('/oauth2/authorize', oauthController.response_type_required, function (req, res, next) {
    if (req.session.user) {
        oauthController.logged(req, res, next)
    } else {
        oauthController.log_in(req, res, next)
    }
});
router.post('/oauth2/authorize', oauthController.response_type_required, function (req, res, next) {
    if (req.session.user) {
        oauthController.authorize(req, res, next)
    } else {
        oauthController.authenticate_user(req, res, next)
    }
});

// Pruebas con el Pep Proxy
router.post('/v3/auth/tokens', oauthController.authenticate_pep_proxy)


// Routes for users sessions
router.get('/auth/login',		sessionController.new);
router.post('/auth/login',		sessionController.create);
router.delete('/auth/logout',	sessionController.destroy);

// Routes for users creation
router.get('/sign_up', 	        userController.new);
router.post('/sign_up',         userController.create);
router.get('/activate',         userController.activate);

// Autoload for applicationId
router.param('applicationId', applicationController.loadApplication);
router.param('pepId',         applicationController.loadPep);
router.param('iotId',         applicationController.loadIot);
router.param('roleId',        applicationController.loadRole);
//router.param('permissionId',  applicationController.loadPermission);
router.param('userId',        userController.loadUser);

// Route to get home of user
router.get('/idm',	sessionController.loginRequired, 	homeController.index)

// Route to save images of applications
imageAppUpload = multer({ dest: './public/img/applications/'})

// Route to save images of users
imageUserUpload = multer({ dest: './public/img/users/'})

// Routes for users
router.get('/idm/users/:userId',                        sessionController.loginRequired, userController.show);
router.get('/idm/users/:userId/edit',                   sessionController.loginRequired, userController.owned_permissions, userController.edit);
router.put('/idm/users/:userId/edit/info',              sessionController.loginRequired, userController.owned_permissions, userController.update_info);
router.put('/idm/users/:userId/edit/avatar',            sessionController.loginRequired, userController.owned_permissions, imageUserUpload.single('image'), userController.update_avatar);
router.delete('/idm/users/:userId/edit/delete_avatar',  sessionController.loginRequired, userController.owned_permissions, userController.delete_avatar);

// Routes to get info about applications
router.get('/idm/applications',  					                        sessionController.loginRequired,	applicationController.index);
router.get('/idm/applications/new',                                         sessionController.loginRequired,    applicationController.new);
router.post('/idm/applications',                                            sessionController.loginRequired,    applicationController.create);
router.get('/idm/applications/:applicationId', 		                        sessionController.loginRequired,	applicationController.show);
router.get('/idm/applications/:applicationId/step/avatar',                  sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.step_new_avatar);
router.post('/idm/applications/:applicationId/step/avatar',                 sessionController.loginRequired,    applicationController.owned_permissions,    imageAppUpload.single('image'),    applicationController.step_create_avatar);
router.get('/idm/applications/:applicationId/step/roles',                   sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.step_new_roles);
router.get('/idm/applications/:applicationId/edit',                         sessionController.loginRequired,	applicationController.owned_permissions,    applicationController.edit);
router.put('/idm/applications/:applicationId/edit/avatar', 		            sessionController.loginRequired,	applicationController.owned_permissions,    imageAppUpload.single('image'),    applicationController.update_avatar);
router.put('/idm/applications/:applicationId/edit/info',                    sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.update_info);
router.get('/idm/applications/:applicationId/edit/roles',                   sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.manage_roles);
router.get('/idm/applications/:applicationId/edit/users',                   sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.get_users);
router.post('/idm/applications/:applicationId/edit/users',                  sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.authorize_users);
router.post('/idm/applications/:applicationId/edit/roles',                  sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.role_permissions_assign);
router.post('/idm/applications/:applicationId/edit/roles/create',           sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.create_role);
router.put('/idm/applications/:applicationId/edit/roles/:roleId/edit',      sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.edit_role);
router.delete('/idm/applications/:applicationId/edit/roles/:roleId/delete', sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.delete_role);
router.post('/idm/applications/:applicationId/edit/permissions/create',     sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.create_permission);
router.delete('/idm/applications/:applicationId/edit/delete_avatar',        sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.delete_avatar);
router.post('/idm/applications/:applicationId/users/available',             sessionController.loginRequired,    applicationController.available_users);
router.get('/idm/applications/:applicationId/iot/register',                 sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.register_iot);
router.get('/idm/applications/:applicationId/iot/:iotId/reset_password',    sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.reset_password_iot);
router.delete('/idm/applications/:applicationId/iot/:iotId/delete',         sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.delete_iot);
router.get('/idm/applications/:applicationId/pep/register',                 sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.register_pep);
router.get('/idm/applications/:applicationId/pep/:pepId/reset_password',    sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.reset_password_pep);
router.delete('/idm/applications/:applicationId/pep/:pepId/delete',         sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.delete_pep);
router.delete('/idm/applications/:applicationId',                           sessionController.loginRequired,	applicationController.owned_permissions,    applicationController.destroy);


module.exports = router;

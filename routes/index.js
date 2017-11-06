var express = require('express');
var multer  = require('multer');
var router = express.Router();

// Create controllers
var applicationController = require('../controllers/application_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var homeController = require('../controllers/home_controller');
var oauthController = require('../controllers/oauth_controller');

// GET Home PAge
router.get('/', function(req, res, next) {
	if (req.session.user) {
        res.render('home/index', {applications: []});
    } else {
    	res.render('index', { errors: [] });
    }
});

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

// Routes for Oauth2
router.post('/oauth2/token',        oauthController.token);
router.get('/oauth2/authorize',     oauthController.log_in);
router.post('/oauth2/authorize',    oauthController.authorize);

// PRUEBA DE OAUTH
/*router.get('/me', oauthController.authenticate(), function(req,res){
  res.json({
    me: req.user,
    messsage: 'Authorization success, Without Scopes, Try accessing /profile with `profile` scope',
    description: 'Try postman https://www.getpostman.com/collections/37afd82600127fbeef28',
    more: 'pass `profile` scope while Authorize'
  })
});*/

// Routes for users sessions
router.get('/auth/login',		sessionController.new);
router.post('/auth/login',		sessionController.create);
router.delete('/auth/logout',	sessionController.destroy);

// Routes for users creation
router.get('/sign_up', 	        userController.new);
router.post('/sign_up',         userController.create);
router.get('/activate',         userController.activate);

// Autoload for applicationId
router.param('applicationId', applicationController.load);

// Route to get home of user
router.get('/idm',	sessionController.loginRequired, 	homeController.index)

imageUpload = multer({ dest: './public/img/applications/'})

//applicationController.owned_permissions

// Routes to get info about applications
router.get('/idm/applications',  					                        sessionController.loginRequired,	applicationController.index);
router.get('/idm/applications/new',                                         sessionController.loginRequired,    applicationController.new);
router.post('/idm/applications',                                            sessionController.loginRequired,    applicationController.create);
router.get('/idm/applications/:applicationId', 		                        sessionController.loginRequired,	applicationController.show);
router.get('/idm/applications/:applicationId/step/avatar',                  sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.step_new_avatar);
router.post('/idm/applications/:applicationId/step/avatar',                 sessionController.loginRequired,    applicationController.owned_permissions,    imageUpload.single('image'),    applicationController.step_create_avatar);
router.get('/idm/applications/:applicationId/step/roles',                   sessionController.loginRequired,    applicationController.owned_permissions,    applicationController.step_new_roles);
router.get('/idm/applications/:applicationId/edit',                         sessionController.loginRequired,	applicationController.owned_permissions,    applicationController.edit);
router.put('/idm/applications/:applicationId/edit/avatar', 		            sessionController.loginRequired,	applicationController.owned_permissions,    imageUpload.single('image'),    applicationController.update_avatar);
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
router.delete('/idm/applications/:applicationId',                           sessionController.loginRequired,	applicationController.owned_permissions,    applicationController.destroy);
router.post('/idm/applications/:applicationId/available/users',             sessionController.loginRequired,    applicationController.available_users);



module.exports = router;

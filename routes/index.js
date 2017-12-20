var express = require('express');
var multer  = require('multer');
var path = require('path');
var uuid = require('uuid');
var router = express.Router();

// Create controllers
var applicationController = require('../controllers/application_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var homeController = require('../controllers/home_controller');
var oauthController = require('../controllers/oauth_controller');
var roleController = require('../controllers/role_controller');
var permissionController = require('../controllers/permission_controller');
var pepProxyController = require('../controllers/pep_proxy_controller');
var iotController = require('../controllers/iot_controller');
var authorizeUserController = require('../controllers/authorize_user_controller');
var checkPermissionsController = require('../controllers/check_permissions_controller');
var adminController = require('../controllers/admin_controller');
var settingsController = require('../controllers/settings_controller');

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


// GET Home Page
router.get('/', function(req, res, next) {
	if (req.session.user) {
        res.redirect('/idm')
    } else {
    	res.render('index', { errors: [] });
    }
});


// Create Oauth Server model
var oauthServer = require('oauth2-server');

router.oauth = new oauthServer({
  model: require('../models/model_oauth_server.js'),
  debug: true
});


// Autoloads
router.param('applicationId', applicationController.load_application);
router.param('pepId',         pepProxyController.load_pep);
router.param('iotId',         iotController.load_iot);
router.param('roleId',        roleController.load_role);
router.param('permissionId',  permissionController.load_permission);
router.param('userId',        userController.load_user);

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

// -- Pruebas con el Pep Proxy
router.post('/v3/auth/tokens', oauthController.authenticate_pep_proxy)


// Routes to administrators
router.get('/idm_admin/notify',                         sessionController.login_required,    adminController.is_admin,     adminController.show_notify)
router.post('/idm_admin/notify',                        sessionController.login_required,    adminController.is_admin,     adminController.send_message)
router.get('/idm_admin/administrators',                 sessionController.login_required,    adminController.is_admin,     adminController.index_administrators)
router.put('/idm_admin/administrators',                 sessionController.login_required,    adminController.is_admin,     adminController.update_administrators)

// Routes for settings
router.get('/settings',             sessionController.login_required,   settingsController.settings);
router.post('/settings/password',   sessionController.login_required,   settingsController.password);
router.post('/settings/email',      sessionController.login_required,   settingsController.email);
router.delete('/settings/cancel',   sessionController.login_required,   settingsController.cancel_account);


// Route to get home of user
router.get('/idm',  sessionController.login_required,    homeController.index)

// Route to get help & about
router.get('/help_about',  sessionController.login_required,    homeController.help_about)



// Routes for users sessions
router.get('/auth/login',		sessionController.new);
router.post('/auth/login',		sessionController.create);
router.delete('/auth/logout',	sessionController.destroy);

// Routes for users creation
router.get('/sign_up', 	        userController.new);
router.post('/sign_up',         userController.create);
router.get('/activate',         userController.activate);


// Route to save images of users
var imageUserUpload = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './public/img/users/')
    },
    filename: function(req, file, callback) {
        callback(null, uuid.v4() + path.extname(file.originalname))
    }
})

// Routes for users
router.get('/idm/users/:userId',                        sessionController.login_required,   userController.show);
router.get('/idm/users/:userId/edit',                   sessionController.login_required,   userController.owned_permissions,   userController.edit);
router.put('/idm/users/:userId/edit/info',              sessionController.login_required,   userController.owned_permissions,   userController.update_info);
router.put('/idm/users/:userId/edit/avatar',            sessionController.login_required,   userController.owned_permissions,   multer({storage: imageUserUpload}).single('image'), userController.update_avatar);
router.put('/idm/users/:userId/edit/avatar/set',        sessionController.login_required,   userController.owned_permissions,   userController.set_avatar);
router.delete('/idm/users/:userId/edit/avatar/delete',  sessionController.login_required,   userController.owned_permissions,   userController.delete_avatar);
router.put('/idm/users/:userId/edit/gravatar',          sessionController.login_required,   userController.owned_permissions,   userController.set_gravatar);
router.post('/idm/users/available',                     sessionController.login_required,   authorizeUserController.available_users);


// Route to save images of applications
var imageAppUpload = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './public/img/applications/')
    },
    filename: function(req, file, callback) {
        callback(null, uuid.v4() + path.extname(file.originalname))
    }
})

// Routes to create, edit and delete applications
router.get('/idm/applications',  					                                        sessionController.login_required,	applicationController.index);
router.get('/idm/applications/new',                                                         sessionController.login_required,    applicationController.new);
router.post('/idm/applications',                                                            sessionController.login_required,    applicationController.create);
router.get('/idm/applications/:applicationId', 		                                        sessionController.login_required,	applicationController.show);
router.get('/idm/applications/:applicationId/step/avatar',                                  sessionController.login_required,    checkPermissionsController.owned_permissions,    applicationController.step_new_avatar);
router.post('/idm/applications/:applicationId/step/avatar',                                 sessionController.login_required,    checkPermissionsController.owned_permissions,    multer({storage: imageAppUpload}).single('image'),   applicationController.step_create_avatar);
router.get('/idm/applications/:applicationId/step/roles',                                   sessionController.login_required,    checkPermissionsController.owned_permissions,    applicationController.step_new_roles);
router.get('/idm/applications/:applicationId/edit',                                         sessionController.login_required,	checkPermissionsController.owned_permissions,    applicationController.edit);
router.put('/idm/applications/:applicationId/edit/avatar', 		                            sessionController.login_required,	checkPermissionsController.owned_permissions,    multer({storage: imageAppUpload}).single('image'),    applicationController.update_avatar);
router.put('/idm/applications/:applicationId/edit/info',                                    sessionController.login_required,    checkPermissionsController.owned_permissions,    applicationController.update_info);
router.delete('/idm/applications/:applicationId/edit/delete_avatar',                        sessionController.login_required,    checkPermissionsController.owned_permissions,    applicationController.delete_avatar);
router.delete('/idm/applications/:applicationId',                                           sessionController.login_required,    checkPermissionsController.owned_permissions,    applicationController.destroy);

// Routes to authorize users in applications
router.get('/idm/applications/:applicationId/edit/users',                                   sessionController.login_required,    checkPermissionsController.owned_permissions,    authorizeUserController.get_users);
router.post('/idm/applications/:applicationId/edit/users',                                  sessionController.login_required,    checkPermissionsController.owned_permissions,    authorizeUserController.authorize_users);

// Routes to handle roles of applications
router.get('/idm/applications/:applicationId/edit/roles',                                   sessionController.login_required,    checkPermissionsController.owned_permissions,    roleController.manage_roles);
router.post('/idm/applications/:applicationId/edit/roles',                                  sessionController.login_required,    checkPermissionsController.owned_permissions,    roleController.role_permissions_assign);
router.post('/idm/applications/:applicationId/edit/roles/create',                           sessionController.login_required,    checkPermissionsController.owned_permissions,    roleController.create_role);
router.put('/idm/applications/:applicationId/edit/roles/:roleId/edit',                      sessionController.login_required,    checkPermissionsController.owned_permissions,    roleController.edit_role);
router.delete('/idm/applications/:applicationId/edit/roles/:roleId/delete',                 sessionController.login_required,    checkPermissionsController.owned_permissions,    roleController.delete_role);

// Routes to handle permissions of applications
router.post('/idm/applications/:applicationId/edit/permissions/create',                     sessionController.login_required,    checkPermissionsController.owned_permissions,    permissionController.create_permission);
router.get('/idm/applications/:applicationId/edit/permissions/:permissionId',               sessionController.login_required,    checkPermissionsController.owned_permissions,    permissionController.get_permission);
router.put('/idm/applications/:applicationId/edit/permissions/:permissionId/edit',          sessionController.login_required,    checkPermissionsController.owned_permissions,    permissionController.edit_permission);
router.delete('/idm/applications/:applicationId/edit/permissions/:permissionId/delete',     sessionController.login_required,    checkPermissionsController.owned_permissions,    permissionController.delete_permission);

// Routes to handle iot of applications
router.get('/idm/applications/:applicationId/iot/register',                                 sessionController.login_required,    checkPermissionsController.owned_permissions,    iotController.register_iot);
router.get('/idm/applications/:applicationId/iot/:iotId/reset_password',                    sessionController.login_required,    checkPermissionsController.owned_permissions,    iotController.reset_password_iot);
router.delete('/idm/applications/:applicationId/iot/:iotId/delete',                         sessionController.login_required,    checkPermissionsController.owned_permissions,    iotController.delete_iot);

// Routes to handle pep proxies of applications
router.get('/idm/applications/:applicationId/pep/register',                                 sessionController.login_required,    checkPermissionsController.owned_permissions,    pepProxyController.register_pep);
router.get('/idm/applications/:applicationId/pep/:pepId/reset_password',                    sessionController.login_required,    checkPermissionsController.owned_permissions,    pepProxyController.reset_password_pep);
router.delete('/idm/applications/:applicationId/pep/:pepId/delete',                         sessionController.login_required,    checkPermissionsController.owned_permissions,    pepProxyController.delete_pep);

module.exports = router;

var express = require('express');
var multer  = require('multer');
var path = require('path');
var uuid = require('uuid');
var router = express.Router();

var csrfProtection = require('../app').csrfProtection;
var parseForm = require('../app').parseForm;

// Create controllers
var applicationController = require('../controllers/application_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var organizationController = require('../controllers/organization_controller');
var manageMembersController = require('../controllers/manage_members_controller');
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
router.get('/', csrfProtection, function(req, res, next) {
	if (req.session.user) {
        res.redirect('/idm')
    } else {
    	res.render('index', { errors: [], csrfToken: req.csrfToken() });
    }
});


// Create Oauth Server model
var oauthServer = require('oauth2-server');

router.oauth = new oauthServer({
  model: require('../models/model_oauth_server.js'),
  debug: true
});


// Autoloads
router.param('applicationId',   applicationController.load_application);
router.param('pepId',           pepProxyController.load_pep);
router.param('iotId',           iotController.load_iot);
router.param('roleId',          roleController.load_role);
router.param('permissionId',    permissionController.load_permission);
router.param('userId',          userController.load_user);
router.param('organizationId',  organizationController.load_organization);

// Routes for Oauth2
// MIRAR SI PONERLE EL CSRF PERO CREO QUE NO QUE EL CAMPO STATE YA LO HACE
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
router.get('/idm_admin/notify',             sessionController.login_required,    sessionController.password_check_date,  adminController.is_admin,  csrfProtection,     adminController.show_notify)
router.post('/idm_admin/notify',            sessionController.login_required,    sessionController.password_check_date,  adminController.is_admin,  parseForm,  csrfProtection,     adminController.send_message)
router.get('/idm_admin/administrators',     sessionController.login_required,    sessionController.password_check_date,  adminController.is_admin,  csrfProtection,     adminController.index_administrators)
router.put('/idm_admin/administrators',     sessionController.login_required,    sessionController.password_check_date,  adminController.is_admin,  parseForm,  csrfProtection,     adminController.update_administrators)

// Routes for settings
router.get('/settings',                 sessionController.login_required,   sessionController.password_check_date,  csrfProtection,  settingsController.settings);
router.post('/settings/password',       sessionController.login_required,   parseForm,  csrfProtection,     settingsController.password);
router.post('/settings/email',          sessionController.login_required,   sessionController.password_check_date,  parseForm,  csrfProtection,  settingsController.email);
router.get('/settings/email/verify',    sessionController.login_required,   sessionController.password_check_date,  csrfProtection,  settingsController.email_verify);
router.delete('/settings/cancel',       sessionController.login_required,   sessionController.password_check_date,  parseForm,  csrfProtection,  settingsController.cancel_account);


// Route to get home of user
router.get('/idm',  sessionController.login_required,    sessionController.password_check_date, csrfProtection,  homeController.index)

// Route to get help & about
router.get('/help_about',       sessionController.login_required,    sessionController.password_check_date, csrfProtection,  homeController.help_about)

// Route to warn user to change password
router.get('/update_password',  sessionController.login_required,   csrfProtection,    sessionController.update_password)


// Routes for users sessions
router.get('/auth/login',		csrfProtection,     sessionController.new);
router.post('/auth/login',      parseForm,  csrfProtection,     sessionController.create);
router.delete('/auth/logout',   parseForm,  csrfProtection,     sessionController.destroy);

// Routes for users creation
router.get('/sign_up', 	            csrfProtection,     userController.new);
router.post('/sign_up',             parseForm,  csrfProtection,     userController.create);
router.get('/activate',             sessionController.login_not_required,   csrfProtection,   userController.activate);
router.get('/password/request',     sessionController.login_not_required,   csrfProtection,   userController.password_request);
router.post('/password/request',    sessionController.login_not_required,   parseForm,  csrfProtection,   userController.password_send_email);
router.get('/password/reset',       sessionController.login_not_required,   csrfProtection,   userController.new_password);
router.post('/password/reset',      sessionController.login_not_required,   parseForm,  csrfProtection,   userController.change_password);
router.get('/confirmation',         sessionController.login_not_required,   csrfProtection,   userController.confirmation);
router.post('/confirmation',        sessionController.login_not_required,   parseForm,  csrfProtection,   userController.resend_confirmation);


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
router.get('/idm/users/:userId',                        sessionController.login_required,   sessionController.password_check_date,  csrfProtection, userController.show);
router.get('/idm/users/:userId/edit',                   sessionController.login_required,   sessionController.password_check_date,  userController.owned_permissions,   parseForm,  csrfProtection,     userController.edit);
router.put('/idm/users/:userId/edit/info',              sessionController.login_required,   sessionController.password_check_date,  userController.owned_permissions,   parseForm,  csrfProtection,     userController.update_info);
router.post('/idm/users/:userId/edit/avatar',           sessionController.login_required,   sessionController.password_check_date,  userController.owned_permissions,   multer({storage: imageUserUpload}).single('image'),  parseForm,  csrfProtection,    userController.update_avatar);
router.put('/idm/users/:userId/edit/avatar',            sessionController.login_required,   sessionController.password_check_date,  userController.owned_permissions,   parseForm,  csrfProtection,     userController.set_avatar);
router.delete('/idm/users/:userId/edit/avatar/delete',  sessionController.login_required,   sessionController.password_check_date,  userController.owned_permissions,   parseForm,  csrfProtection,     userController.delete_avatar);
router.put('/idm/users/:userId/edit/gravatar',          sessionController.login_required,   sessionController.password_check_date,  userController.owned_permissions,   parseForm,  csrfProtection,     userController.set_gravatar);
router.post('/idm/users/available',                     sessionController.login_required,   sessionController.password_check_date,  parseForm,  csrfProtection,     authorizeUserController.available_users);


// Routes for organziations
router.get('/idm/organizations',                                         sessionController.login_required,   sessionController.password_check_date,  csrfProtection, organizationController.index);
router.get('/filters/organizations',                                     sessionController.login_required,   sessionController.password_check_date,  csrfProtection, organizationController.filter);
router.get('/idm/organizations/new',                                     sessionController.login_required,   sessionController.password_check_date,  csrfProtection, organizationController.new);
router.post('/idm/organizations',                                        sessionController.login_required,   sessionController.password_check_date,  parseForm,  csrfProtection, organizationController.create);
router.get('/idm/organizations/:organizationId',                         sessionController.login_required,   sessionController.password_check_date,  csrfProtection, organizationController.show);
router.get('/idm/organizations/:organizationId/members',                 sessionController.login_required,   sessionController.password_check_date,  csrfProtection, organizationController.get_members);
router.get('/idm/organizations/:organizationId/edit',                    sessionController.login_required,   sessionController.password_check_date,  organizationController.owned_permissions,  csrfProtection, organizationController.edit);
router.put('/idm/organizations/:organizationId/edit/avatar',             sessionController.login_required,   sessionController.password_check_date,  organizationController.owned_permissions,  multer({storage: imageAppUpload}).single('image'), parseForm,  csrfProtection,  organizationController.update_avatar);
router.put('/idm/organizations/:organizationId/edit/info',               sessionController.login_required,   sessionController.password_check_date,  organizationController.owned_permissions,  parseForm,  csrfProtection,    organizationController.update_info);
router.delete('/idm/organizations/:organizationId/edit/delete_avatar',   sessionController.login_required,   sessionController.password_check_date,  organizationController.owned_permissions,  parseForm,  csrfProtection,    organizationController.delete_avatar);
router.delete('/idm/organizations/:organizationId',                      sessionController.login_required,   sessionController.password_check_date,  organizationController.owned_permissions,  parseForm,  csrfProtection,    organizationController.destroy);

// Routes to manage members in organizations
router.get('/idm/organizations/:organizationId/edit/members',            sessionController.login_required,   sessionController.password_check_date,  organizationController.owned_permissions,  csrfProtection,    manageMembersController.get_members);
router.post('/idm/organizations/:organizationId/edit/members',           sessionController.login_required,   sessionController.password_check_date,  organizationController.owned_permissions,  parseForm,  csrfProtection,    manageMembersController.add_members);


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
router.get('/idm/applications',  					                                        sessionController.login_required,   sessionController.password_check_date,  	csrfProtection,     applicationController.index);
router.get('/filters/applications',                                                         sessionController.login_required,   sessionController.password_check_date,      csrfProtection,     applicationController.filter);
router.get('/idm/applications/new',                                                         sessionController.login_required,   sessionController.password_check_date,      csrfProtection,     applicationController.new);
router.post('/idm/applications',                                                            sessionController.login_required,   sessionController.password_check_date,      parseForm,  csrfProtection,     applicationController.create);
router.get('/idm/applications/:applicationId', 		                                        sessionController.login_required,   sessionController.password_check_date,  	csrfProtection,     applicationController.show);
router.get('/idm/applications/:applicationId/step/avatar',                                  sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    csrfProtection,    applicationController.step_new_avatar);
router.post('/idm/applications/:applicationId/step/avatar',                                 sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    multer({storage: imageAppUpload}).single('image'), parseForm,  csrfProtection,  applicationController.step_create_avatar);
router.get('/idm/applications/:applicationId/step/roles',                                   sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    csrfProtection,    applicationController.step_new_roles);
router.get('/idm/applications/:applicationId/edit',                                         sessionController.login_required,   sessionController.password_check_date,  	checkPermissionsController.owned_permissions,    csrfProtection,    applicationController.edit);
router.put('/idm/applications/:applicationId/edit/avatar', 		                            sessionController.login_required,   sessionController.password_check_date,  	checkPermissionsController.owned_permissions,    multer({storage: imageAppUpload}).single('image'), parseForm,  csrfProtection,  applicationController.update_avatar);
router.put('/idm/applications/:applicationId/edit/info',                                    sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    applicationController.update_info);
router.delete('/idm/applications/:applicationId/edit/delete_avatar',                        sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    applicationController.delete_avatar);
router.delete('/idm/applications/:applicationId',                                           sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    applicationController.destroy);

// Routes to authorize users in applications
router.get('/idm/applications/:applicationId/edit/users',                                   sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    csrfProtection,    authorizeUserController.get_users);
router.post('/idm/applications/:applicationId/edit/users',                                  sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    authorizeUserController.authorize_users);

// Routes to handle roles of applications
router.get('/idm/applications/:applicationId/edit/roles',                                   sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    csrfProtection,    roleController.manage_roles);
router.post('/idm/applications/:applicationId/edit/roles',                                  sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    roleController.role_permissions_assign);
router.post('/idm/applications/:applicationId/edit/roles/create',                           sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    roleController.create_role);
router.put('/idm/applications/:applicationId/edit/roles/:roleId/edit',                      sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    roleController.edit_role);
router.delete('/idm/applications/:applicationId/edit/roles/:roleId/delete',                 sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    roleController.delete_role);

// Routes to handle permissions of applications
router.post('/idm/applications/:applicationId/edit/permissions/create',                     sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    permissionController.create_permission);
router.get('/idm/applications/:applicationId/edit/permissions/:permissionId',               sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    csrfProtection,    permissionController.get_permission);
router.put('/idm/applications/:applicationId/edit/permissions/:permissionId/edit',          sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    permissionController.edit_permission);
router.delete('/idm/applications/:applicationId/edit/permissions/:permissionId/delete',     sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    permissionController.delete_permission);

// Routes to handle iot of applications
router.get('/idm/applications/:applicationId/iot/register',                                 sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    csrfProtection,    iotController.register_iot);
router.get('/idm/applications/:applicationId/iot/:iotId/reset_password',                    sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    csrfProtection,    iotController.reset_password_iot);
router.delete('/idm/applications/:applicationId/iot/:iotId/delete',                         sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    iotController.delete_iot);

// Routes to handle pep proxies of applications
router.get('/idm/applications/:applicationId/pep/register',                                 sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    csrfProtection,    pepProxyController.register_pep);
router.get('/idm/applications/:applicationId/pep/:pepId/reset_password',                    sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    csrfProtection,    pepProxyController.reset_password_pep);
router.delete('/idm/applications/:applicationId/pep/:pepId/delete',                         sessionController.login_required,   sessionController.password_check_date,      checkPermissionsController.owned_permissions,    parseForm,  csrfProtection,    pepProxyController.delete_pep);

module.exports = router;

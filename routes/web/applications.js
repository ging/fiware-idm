var express = require('express');
var router = express.Router();
var multer  = require('multer');
var path = require('path');
var uuid = require('uuid');
var csrf = require('csurf')
var bodyParser = require('body-parser');
var csrfProtection = csrf({ cookie: true })
var fs = require('fs');

// Config file
var config = require('../../config');

// Home web Controller
var web_app_controller = require('../../controllers/web/index').applications;
var web_check_perm_controller = require('../../controllers/web/index').check_permissions;
var web_auth_user_controller = require('../../controllers/web/index').authorize_user_apps;
var web_auth_org_controller = require('../../controllers/web/index').authorize_org_apps;
var web_trusted_apps_controller = require('../../controllers/web/index').trusted_apps;
var web_role_controller = require('../../controllers/web/index').roles;
var web_perm_controller = require('../../controllers/web/index').permissions;
var web_peppx_controller = require('../../controllers/web/index').pep_proxies;
var web_iota_controller = require('../../controllers/web/index').iot_agents;
var saml2Controller = require('../../controllers/saml2/saml2');

// Autoloads
router.param('applicationId',   web_app_controller.load_application);
router.param('pepId',           web_peppx_controller.load_pep);
router.param('iotId',           web_iota_controller.load_iot);
router.param('roleId',          web_role_controller.load_role);
router.param('permissionId',    web_perm_controller.load_permission);

// Route to save images of applications
var imageAppUpload = multer.diskStorage({
    destination: function(req, file, callback) {
        if (!fs.existsSync('public/img/applications/')){
          fs.mkdirSync('./public/img/applications/');
        }
        callback(null, './public/img/applications/')
    },
    filename: function(req, file, callback) {
        callback(null, uuid.v4() + path.extname(file.originalname))
    }
})

router.get('/available',                       csrfProtection,  web_trusted_apps_controller.available_applications);

// Routes to create, edit and delete applications
router.get('/',  					                                      	 csrfProtection,     web_app_controller.index);
router.get('/filtered_user',                                          		 csrfProtection,     web_app_controller.filter_user);
router.get('/filtered_organization',                                         csrfProtection,     web_app_controller.filter_organization);
router.get('/new',                                                           csrfProtection,     web_app_controller.new);
router.post('/',                                                             csrfProtection,     web_app_controller.create);
router.get('/:applicationId/authorized_users',                               csrfProtection,     web_app_controller.authorized_users);
router.get('/:applicationId/authorized_organizations',                       csrfProtection,     web_app_controller.authorized_organizations);
router.get('/:applicationId/trusted_applications',                           csrfProtection,     web_trusted_apps_controller.get_trusted_applications);
if (config.eidas) {
    router.get('/:applicationId', 		                                     web_check_perm_controller.owned_permissions,    csrfProtection, saml2Controller.search_eidas_credentials,	web_app_controller.show);
} else {
    router.get('/:applicationId',                                            web_check_perm_controller.owned_permissions,    csrfProtection,    web_app_controller.show);
}
router.get('/:applicationId/step/avatar',                                    web_check_perm_controller.owned_permissions,    csrfProtection,    web_app_controller.step_new_avatar);
router.post('/:applicationId/step/avatar',                                   web_check_perm_controller.owned_permissions,    multer({storage: imageAppUpload}).single('image'), csrfProtection,  web_app_controller.step_create_avatar);
router.get('/:applicationId/step/roles',                                     web_check_perm_controller.owned_permissions,    csrfProtection,    web_app_controller.step_new_roles);
router.get('/:applicationId/edit',                                       	 web_check_perm_controller.owned_permissions,    csrfProtection,    web_app_controller.edit);
router.put('/:applicationId/edit/avatar', 		                          	 web_check_perm_controller.owned_permissions,    multer({storage: imageAppUpload}).single('image'), csrfProtection,  web_app_controller.update_avatar);
router.put('/:applicationId/edit/info',                                      web_check_perm_controller.owned_permissions,    csrfProtection,    web_app_controller.update_info);
router.delete('/:applicationId/edit/delete_avatar',                          web_check_perm_controller.owned_permissions,    csrfProtection,    web_app_controller.delete_avatar);
router.delete('/:applicationId',                                             web_check_perm_controller.owned_permissions,    csrfProtection,    web_app_controller.destroy);

// Route to handl trusted applications
router.post('/:applicationId/edit/trusted_applications',                     web_check_perm_controller.owned_permissions,    csrfProtection,    web_trusted_apps_controller.set_trusted_applications);

// Routes to authorize users in applications
router.get('/:applicationId/edit/users',                                     web_check_perm_controller.owned_permissions,    csrfProtection,    web_auth_user_controller.get_users);
router.post('/:applicationId/edit/users',                                    web_check_perm_controller.owned_permissions,    csrfProtection,    web_auth_user_controller.authorize_users);

// Routes to authorize organizations in applications
router.get('/:applicationId/edit/organizations',                             web_check_perm_controller.owned_permissions,    csrfProtection,    web_auth_org_controller.get_organizations);
router.post('/:applicationId/edit/organizations',                            web_check_perm_controller.owned_permissions,    csrfProtection,    web_auth_org_controller.authorize_organizations);

// Routes to handle roles of applications
router.get('/:applicationId/edit/roles',                                     web_check_perm_controller.owned_permissions,    csrfProtection,    web_role_controller.manage_roles_view);
router.get('/:applicationId/edit/roles/assignments',                         web_check_perm_controller.owned_permissions,    csrfProtection,    web_role_controller.manage_roles);
router.post('/:applicationId/edit/roles',                                    web_check_perm_controller.owned_permissions,    csrfProtection,    web_role_controller.role_permissions_assign);
router.post('/:applicationId/edit/roles/create',                             web_check_perm_controller.owned_permissions,    csrfProtection,    web_role_controller.create_role);
router.put('/:applicationId/edit/roles/:roleId/edit',                        web_check_perm_controller.owned_permissions,    csrfProtection,    web_role_controller.edit_role);
router.delete('/:applicationId/edit/roles/:roleId/delete',                   web_check_perm_controller.owned_permissions,    csrfProtection,    web_role_controller.delete_role);

// Routes to handle permissions of applications
router.post('/:applicationId/edit/permissions/create',                       web_check_perm_controller.owned_permissions,    csrfProtection,    web_perm_controller.create_permission);
router.get('/:applicationId/edit/permissions/:permissionId',                 web_check_perm_controller.owned_permissions,    csrfProtection,    web_perm_controller.get_permission);
router.put('/:applicationId/edit/permissions/:permissionId/edit',            web_check_perm_controller.owned_permissions,    csrfProtection,    web_perm_controller.edit_permission);
router.delete('/:applicationId/edit/permissions/:permissionId/delete',       web_check_perm_controller.owned_permissions,    csrfProtection,    web_perm_controller.delete_permission);

// Routes to handle iot of applications
router.get('/:applicationId/iot/register',                                   web_check_perm_controller.owned_permissions,    csrfProtection,    web_iota_controller.register_iot);
router.get('/:applicationId/iot/:iotId/reset_password',                      web_check_perm_controller.owned_permissions,    csrfProtection,    web_iota_controller.reset_password_iot);
router.delete('/:applicationId/iot/:iotId/delete',                           web_check_perm_controller.owned_permissions,    csrfProtection,    web_iota_controller.delete_iot);

// Routes to handle pep proxies of applications
router.get('/:applicationId/pep/register',                                   web_check_perm_controller.owned_permissions,    csrfProtection,    web_peppx_controller.register_pep);
router.get('/:applicationId/pep/:pepId/reset_password',                      web_check_perm_controller.owned_permissions,    csrfProtection,    web_peppx_controller.reset_password_pep);
router.delete('/:applicationId/pep/:pepId/delete',                           web_check_perm_controller.owned_permissions,    csrfProtection,    web_peppx_controller.delete_pep);

// Routes to handle token type
router.put('/:applicationId/token_types/change',                             web_check_perm_controller.owned_permissions,    csrfProtection,    web_app_controller.change_token_type);
router.get('/:applicationId/token_types/reset',                              web_check_perm_controller.owned_permissions,    csrfProtection,    web_app_controller.reset_jwt_secret);

// Routes to handle SAML with eidas
if (config.eidas) {
	router.get('/:applicationId/step/eidas',                                     web_check_perm_controller.owned_permissions,    csrfProtection,    saml2Controller.step_new_eidas_crendentials);
	router.post('/:applicationId/step/eidas',                                    web_check_perm_controller.owned_permissions,    csrfProtection,    saml2Controller.step_create_eidas_crendentials);
    router.put('/:applicationId/edit/eidas/info',                                web_check_perm_controller.owned_permissions,    csrfProtection,    saml2Controller.search_eidas_credentials,   saml2Controller.update_eidas_info);
    router.put('/:applicationId/edit/eidas/attributes',                          web_check_perm_controller.owned_permissions,    csrfProtection,    saml2Controller.update_eidas_attributes);
    router.get('/:applicationId/edit/eidas',                                     web_check_perm_controller.owned_permissions,    csrfProtection,    saml2Controller.search_eidas_credentials,   saml2Controller.edit_eidas_crendentials);
	router.get('/:applicationId/saml2/metadata',                         	     saml2Controller.search_eidas_credentials,       saml2Controller.saml2_metadata);
    router.post('/:applicationId/saml2/login',                                   saml2Controller.search_eidas_credentials,       saml2Controller.saml2_application_login);
}

module.exports = router;
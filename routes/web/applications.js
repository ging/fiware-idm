const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
const csrf = require('csurf');
const csrf_protection = csrf({ cookie: true });
const fs = require('fs');

// Config file
const config = require('../../config');

const index_controller = require('../../controllers/web/index');

// Home web Controller
const web_app_controller = index_controller.applications;
const web_check_perm_controller = index_controller.check_permissions;
const web_auth_user_controller = index_controller.authorize_user_apps;
const web_auth_org_controller = index_controller.authorize_org_apps;
const web_trusted_apps_controller = index_controller.trusted_apps;
const web_role_controller = index_controller.roles;
const web_perm_controller = index_controller.permissions;
const web_usage_policies_controller = index_controller.usage_policies;
const web_ptp_controller = index_controller.ptps;
const web_peppx_controller = index_controller.pep_proxies;
const web_iota_controller = index_controller.iot_agents;
const saml2_controller = require('../../controllers/saml2/saml2');

// Autoloads
router.param('application_id', web_app_controller.load_application);
router.param('pep_id', web_peppx_controller.load_pep);
router.param('iot_id', web_iota_controller.load_iot);
router.param('role_id', web_role_controller.load_role);
router.param('permission_id', web_perm_controller.load_permission);

// Route to save images of applications
const image_app_upload = multer.diskStorage({
  destination(req, file, callback) {
    if (!fs.existsSync('public/img/applications/')) {
      fs.mkdirSync('./public/img/applications/');
    }
    callback(null, './public/img/applications/');
  },
  filename(req, file, callback) {
    callback(null, uuid.v4() + path.extname(file.originalname));
  }
});

router.get('/available', csrf_protection, web_trusted_apps_controller.available_applications);

// Routes to create, edit and delete applications
router.get('/', csrf_protection, web_app_controller.index);
router.get('/filtered_user', csrf_protection, web_app_controller.filter_user);
router.get('/filtered_organization', csrf_protection, web_app_controller.filter_organization);
router.get('/new', csrf_protection, web_app_controller.new);
router.post('/', csrf_protection, web_app_controller.create);
router.get('/:application_id/authorized_users', csrf_protection, web_app_controller.authorized_users);
router.get('/:application_id/authorized_organizations', csrf_protection, web_app_controller.authorized_organizations);
router.get(
  '/:application_id/trusted_applications',
  csrf_protection,
  web_trusted_apps_controller.get_trusted_applications
);
if (config.eidas) {
  router.get(
    '/:application_id',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    saml2_controller.search_eidas_credentials,
    web_app_controller.show
  );
} else {
  router.get('/:application_id', web_check_perm_controller.owned_permissions, csrf_protection, web_app_controller.show);
}
router.get(
  '/:application_id/step/avatar',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_app_controller.step_new_avatar
);
router.post(
  '/:application_id/step/avatar',
  web_check_perm_controller.owned_permissions,
  multer({ storage: image_app_upload }).single('image'),
  csrf_protection,
  web_app_controller.step_create_avatar
);
router.get(
  '/:application_id/step/roles',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_app_controller.step_new_roles
);
router.get(
  '/:application_id/edit',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_app_controller.edit
);
router.put(
  '/:application_id/edit/avatar',
  web_check_perm_controller.owned_permissions,
  multer({ storage: image_app_upload }).single('image'),
  csrf_protection,
  web_app_controller.update_avatar
);
router.put(
  '/:application_id/edit/info',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_app_controller.update_info
);
router.delete(
  '/:application_id/edit/delete_avatar',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_app_controller.delete_avatar
);
router.delete(
  '/:application_id',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_app_controller.destroy
);

// Route to handl trusted applications
router.post(
  '/:application_id/edit/trusted_applications',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_trusted_apps_controller.set_trusted_applications
);

// Routes to authorize users in applications
router.get(
  '/:application_id/edit/users',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_auth_user_controller.get_users
);
router.post(
  '/:application_id/edit/users',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_auth_user_controller.authorize_users
);

// Routes to authorize organizations in applications
router.get(
  '/:application_id/edit/organizations',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_auth_org_controller.get_organizations
);
router.post(
  '/:application_id/edit/organizations',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_auth_org_controller.authorize_organizations
);

// Routes to handle roles of applications
router.get(
  '/:application_id/edit/roles',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_role_controller.manage_roles_view
);
router.get(
  '/:application_id/edit/roles/assignments',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_role_controller.manage_roles
);
router.post(
  '/:application_id/edit/roles',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_role_controller.role_permissions_assign
);
router.post(
  '/:application_id/edit/roles/create',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_role_controller.create_role
);
router.put(
  '/:application_id/edit/roles/:role_id/edit',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_role_controller.edit_role
);
router.delete(
  '/:application_id/edit/roles/:role_id/delete',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_role_controller.delete_role
);

// Routes to handle permissions of applications
router.post(
  '/:application_id/edit/permissions/create',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_perm_controller.create_permission
);
router.get(
  '/:application_id/edit/permissions/:permission_id',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_perm_controller.get_permission
);
router.put(
  '/:application_id/edit/permissions/:permission_id/edit',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_perm_controller.edit_permission
);
router.delete(
  '/:application_id/edit/permissions/:permission_id/delete',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_perm_controller.delete_permission
);

if (config.usage_control.enabled) {
  // Routes to handle data usage policies
  router.get(
    '/:application_id/edit/usage_policies',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    web_usage_policies_controller.index
  );
  router.post(
    '/:application_id/edit/usage_policies',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    web_usage_policies_controller.create
  );
  router.put(
    '/:application_id/edit/usage_policies/:usage_policy_id',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    web_usage_policies_controller.edit
  );
  router.delete(
    '/:application_id/edit/usage_policies/:usage_policy_id',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    web_usage_policies_controller.delete
  );
  // POST PREVIOUS JOB ID
  router.post('/:application_id/job_id', web_ptp_controller.create_job_id);
}

// Routes to handle iot of applications
router.get(
  '/:application_id/iot/register',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_iota_controller.register_iot
);
router.get(
  '/:application_id/iot/:iot_id/reset_password',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_iota_controller.reset_password_iot
);
router.delete(
  '/:application_id/iot/:iot_id/delete',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_iota_controller.delete_iot
);

// Routes to handle pep proxies of applications
router.get(
  '/:application_id/pep/register',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_peppx_controller.register_pep
);
router.get(
  '/:application_id/pep/:pep_id/reset_password',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_peppx_controller.reset_password_pep
);
router.delete(
  '/:application_id/pep/:pep_id/delete',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_peppx_controller.delete_pep
);

// Routes to handle token type
router.put(
  '/:application_id/token_types/change',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_app_controller.change_token_type
);
router.get(
  '/:application_id/token_types/reset',
  web_check_perm_controller.owned_permissions,
  csrf_protection,
  web_app_controller.reset_jwt_secret
);

// Routes to handle SAML with eidas
if (config.eidas) {
  router.get(
    '/:application_id/step/eidas',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    saml2_controller.step_new_eidas_crendentials
  );
  router.post(
    '/:application_id/step/eidas',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    saml2_controller.step_create_eidas_crendentials
  );
  router.put(
    '/:application_id/edit/eidas/info',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    saml2_controller.search_eidas_credentials,
    saml2_controller.update_eidas_info
  );
  router.put(
    '/:application_id/edit/eidas/attributes',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    saml2_controller.update_eidas_attributes
  );
  router.get(
    '/:application_id/edit/eidas',
    web_check_perm_controller.owned_permissions,
    csrf_protection,
    saml2_controller.search_eidas_credentials,
    saml2_controller.edit_eidas_crendentials
  );
  router.get(
    '/:application_id/saml2/metadata',
    saml2_controller.search_eidas_credentials,
    saml2_controller.saml2_metadata
  );
  router.post(
    '/:application_id/saml2/login',
    saml2_controller.search_eidas_credentials,
    saml2_controller.saml2_application_login
  );
}

module.exports = router;

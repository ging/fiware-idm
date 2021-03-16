const express = require('express');
const router = express();

// Load API Controllers
const api_controller = require('../../controllers/api/index');
const api_appl_controller = api_controller.applications;
const api_user_controller = api_controller.users;
const api_org_controller = api_controller.organizations;
const api_check_perm_controller = api_controller.check_permissions;
const api_role_controller = api_controller.roles;
const api_perm_controller = api_controller.permissions;
const api_peppx_controller = api_controller.pep_proxies;
const api_iota_controller = api_controller.iot_agents;
const api_role_pem_assign_controller = api_controller.role_permission_assignments;
const api_role_user_assign_controller = api_controller.role_user_assignments;
const api_role_org_assign_controller = api_controller.role_organization_assignments;
const api_trusted_app_controller = api_controller.trusted_applications;

// Load application with :application_id or :trusted_application_id parameter and check permissions of user in request
router.param('application_id', api_appl_controller.load_application);
router.param('trusted_application_id', api_trusted_app_controller.load_trusted_application);

// Load other params
router.param('role_id', api_role_controller.load_role);
router.param('permission_id', api_perm_controller.load_permission);
router.param('iot_agent_id', api_iota_controller.load_iota);
router.param('user_id', api_user_controller.load_user);
router.param('organization_id', api_org_controller.load_organization);
router.param('organization_role_id', api_org_controller.load_organization_role);

// Routes for applications
router.post('/', api_check_perm_controller.check_request, api_appl_controller.create);
router.get('/', api_check_perm_controller.check_request, api_appl_controller.index);
router.get('/:application_id', api_appl_controller.info);
router.patch('/:application_id', api_appl_controller.update);
router.delete('/:application_id', api_appl_controller.delete);

// Routes for pep_proxies
router.all('/:application_id/pep_proxies', api_peppx_controller.search_pep_proxy);
router.get('/:application_id/pep_proxies', api_peppx_controller.info);
router.post('/:application_id/pep_proxies', api_peppx_controller.create);
router.patch('/:application_id/pep_proxies', api_peppx_controller.update);
router.delete('/:application_id/pep_proxies', api_peppx_controller.delete);

// Routes for iot agents
router.get('/:application_id/iot_agents', api_iota_controller.index);
router.post('/:application_id/iot_agents', api_iota_controller.create);
router.get('/:application_id/iot_agents/:iot_agent_id', api_iota_controller.info);
router.patch('/:application_id/iot_agents/:iot_agent_id', api_iota_controller.update);
router.delete('/:application_id/iot_agents/:iot_agent_id', api_iota_controller.delete);

// Routes for roles
router.get('/:application_id/roles', api_role_controller.index);
router.post('/:application_id/roles', api_role_controller.create);
router.get('/:application_id/roles/:role_id', api_role_controller.info);
router.patch('/:application_id/roles/:role_id', api_role_controller.update);
router.delete('/:application_id/roles/:role_id', api_role_controller.delete);

// Routes for permissions
router.get('/:application_id/permissions', api_perm_controller.index);
router.post('/:application_id/permissions', api_perm_controller.create);
router.get('/:application_id/permissions/:permission_id', api_perm_controller.info);
router.patch('/:application_id/permissions/:permission_id', api_perm_controller.update);
router.delete('/:application_id/permissions/:permission_id', api_perm_controller.delete);

// Routes for role_permission_assignments
router.get('/:application_id/roles/:role_id/permissions', api_role_pem_assign_controller.index);
router.put('/:application_id/roles/:role_id/permissions/:permission_id', api_role_pem_assign_controller.create);
router.delete('/:application_id/roles/:role_id/permissions/:permission_id', api_role_pem_assign_controller.delete);
// POST endpoint is deprecated - maintained for backwards compatibility
router.post('/:application_id/roles/:role_id/permissions/:permission_id', api_role_pem_assign_controller.create);

// Routes for role_user_assignments
router.get(
  '/:application_id/users',
  api_role_controller.search_changeable_roles,
  api_role_user_assign_controller.index_users
);
router.get(
  '/:application_id/users/:user_id/roles',
  api_role_controller.search_changeable_roles,
  api_role_user_assign_controller.index_user_roles
);
router.put(
  '/:application_id/users/:user_id/roles/:role_id',
  api_role_controller.search_changeable_roles,
  api_role_user_assign_controller.addRole
);
router.delete(
  '/:application_id/users/:user_id/roles/:role_id',
  api_role_controller.search_changeable_roles,
  api_role_user_assign_controller.removeRole
);
// POST endpoint is deprecated - maintained for backwards compatibility
router.post(
  '/:application_id/users/:user_id/roles/:role_id',
  api_role_controller.search_changeable_roles,
  api_role_user_assign_controller.addRole
);

// Routes for role_organization_assignments
router.get(
  '/:application_id/organizations',
  api_role_controller.search_changeable_roles,
  api_role_org_assign_controller.index_organizations
);
router.get(
  '/:application_id/organizations/:organization_id/roles',
  api_role_controller.search_changeable_roles,
  api_role_org_assign_controller.index_organization_roles
);
router.put(
  '/:application_id/organizations/:organization_id/roles/:role_id/organization_roles/:organization_role_id',
  api_role_controller.search_changeable_roles,
  api_role_org_assign_controller.addRole
);
router.delete(
  '/:application_id/organizations/:organization_id/roles/:role_id/organization_roles/:organization_role_id',
  api_role_controller.search_changeable_roles,
  api_role_org_assign_controller.removeRole
);
// POST endpoint is deprecated - maintained for backwards compatibility
router.post(
  '/:application_id/organizations/:organization_id/roles/:role_id/organization_roles/:organization_role_id',
  api_role_controller.search_changeable_roles,
  api_role_org_assign_controller.addRole
);

// Routes for trusted applications
router.get('/:application_id/trusted_applications', api_trusted_app_controller.index);
router.put('/:application_id/trusted_applications/:trusted_application_id', api_trusted_app_controller.addTrusted);
router.delete(
  '/:application_id/trusted_applications/:trusted_application_id',
  api_trusted_app_controller.removeTrusted
);
// POST endpoint is deprecated - maintained for backwards compatibility
router.post('/:application_id/trusted_applications/:trusted_application_id', api_trusted_app_controller.addTrusted);

module.exports = router;

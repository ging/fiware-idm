var express = require('express');
var router = express();

// Load API Controllers
var api_controller = require('../../controllers/api/index')
var api_appl_controller = api_controller.applications;
var api_user_controller = api_controller.users;
var api_org_controller = api_controller.organizations;
var api_check_perm_controller = api_controller.check_permissions;
var api_role_controller = api_controller.roles;
var api_perm_controller = api_controller.permissions;
var api_peppx_controller = api_controller.pep_proxies;
var api_iota_controller = api_controller.iot_agents;
var api_role_pem_assign_controller = api_controller.role_permission_assignments;
var api_role_user_assign_controller = api_controller.role_user_assignments;
var api_role_org_assign_controller = api_controller.role_organization_assignments;
var api_trusted_app_controller = api_controller.trusted_applications;

// Load application with :applicationId or :trustedApplicationId parameter and check permissions of user in request
router.param('applicationId',   		api_appl_controller.load_application);
router.param('trustedApplicationId',	api_trusted_app_controller.load_trusted_application);

// Load other params
router.param('roleId',   			api_role_controller.load_role);
router.param('permissionId',   		api_perm_controller.load_permission);
router.param('iotAgentId', 			api_iota_controller.load_iota);
router.param('userId',   			api_user_controller.load_user);
router.param('organizationId',   	api_org_controller.load_organization);
router.param('organizationRoleId',  api_org_controller.load_organization_role);

// Routes for applications
router.post('/', 					api_check_perm_controller.check_request, 	api_appl_controller.create);
router.get('/', 					api_check_perm_controller.check_request, 	api_appl_controller.index);
router.get('/:applicationId', 		api_appl_controller.info);
router.patch('/:applicationId', 	api_appl_controller.update);
router.delete('/:applicationId', 	api_appl_controller.delete);

// Routes for pep_proxies
router.all('/:applicationId/pep_proxies', 		api_peppx_controller.search_pep_proxy)
router.get('/:applicationId/pep_proxies', 		api_peppx_controller.info);
router.post('/:applicationId/pep_proxies', 		api_peppx_controller.create);
router.patch('/:applicationId/pep_proxies', 	api_peppx_controller.update);
router.delete('/:applicationId/pep_proxies', 	api_peppx_controller.delete);

// Routes for iot agents
router.get('/:applicationId/iot_agents', 				api_iota_controller.index);
router.post('/:applicationId/iot_agents', 				api_iota_controller.create);
router.get('/:applicationId/iot_agents/:iotAgentId', 	api_iota_controller.info);
router.patch('/:applicationId/iot_agents/:iotAgentId', 	api_iota_controller.update);
router.delete('/:applicationId/iot_agents/:iotAgentId', api_iota_controller.delete);

// Routes for roles
router.get('/:applicationId/roles', 			api_role_controller.index);
router.post('/:applicationId/roles', 			api_role_controller.create);
router.get('/:applicationId/roles/:roleId', 	api_role_controller.info);
router.patch('/:applicationId/roles/:roleId', 	api_role_controller.update);
router.delete('/:applicationId/roles/:roleId', 	api_role_controller.delete);

// Routes for permissions
router.get('/:applicationId/permissions', 					api_perm_controller.index);
router.post('/:applicationId/permissions', 					api_perm_controller.create);
router.get('/:applicationId/permissions/:permissionId', 	api_perm_controller.info);
router.patch('/:applicationId/permissions/:permissionId', 	api_perm_controller.update);
router.delete('/:applicationId/permissions/:permissionId', 	api_perm_controller.delete);

// Routes for role_permission_assignments
router.get('/:applicationId/roles/:roleId/permissions', 					api_role_pem_assign_controller.index);
router.post('/:applicationId/roles/:roleId/permissions/:permissionId', 		api_role_pem_assign_controller.create);
router.delete('/:applicationId/roles/:roleId/permissions/:permissionId', 	api_role_pem_assign_controller.delete);

// Routes for role_user_assignments
router.get('/:applicationId/users', 							api_role_controller.search_changeable_roles,	api_role_user_assign_controller.index_users);
router.get('/:applicationId/users/:userId/roles', 				api_role_controller.search_changeable_roles,	api_role_user_assign_controller.index_user_roles);
router.put('/:applicationId/users/:userId/roles/:roleId', 		api_role_controller.search_changeable_roles,	api_role_user_assign_controller.addRole);
router.delete('/:applicationId/users/:userId/roles/:roleId', 	api_role_controller.search_changeable_roles,	api_role_user_assign_controller.removeRole);
// POST endpoint is deprecated - maintained for backwards compatibility
router.post('/:applicationId/users/:userId/roles/:roleId', 		api_role_controller.search_changeable_roles,	api_role_user_assign_controller.addRole);

// Routes for role_organization_assignments
router.get('/:applicationId/organizations', 																		api_role_controller.search_changeable_roles,	api_role_org_assign_controller.index_organizations);
router.get('/:applicationId/organizations/:organizationId/roles', 													api_role_controller.search_changeable_roles,	api_role_org_assign_controller.index_organization_roles);
router.put('/:applicationId/organizations/:organizationId/roles/:roleId/organization_roles/:organizationRoleId', 	api_role_controller.search_changeable_roles,	api_role_org_assign_controller.addRole);
router.delete('/:applicationId/organizations/:organizationId/roles/:roleId/organization_roles/:organizationRoleId', api_role_controller.search_changeable_roles,	api_role_org_assign_controller.removeRole);
// POST endpoint is deprecated - maintained for backwards compatibility
router.post('/:applicationId/organizations/:organizationId/roles/:roleId/organization_roles/:organizationRoleId', 	api_role_controller.search_changeable_roles,	api_role_org_assign_controller.addRole);


// Routes for trusted applications
router.get('/:applicationId/trusted_applications', 							api_trusted_app_controller.index);
router.post('/:applicationId/trusted_applications/:trustedApplicationId', 	api_trusted_app_controller.create);
router.delete('/:applicationId/trusted_applications/:trustedApplicationId', api_trusted_app_controller.delete);

module.exports = router;
var express = require('express');
var router = express.Router();

// API Controller
var apiController = require('../controllers/api/index');

// Routes for authentication
router.post('/v1/auth/tokens', apiController.authenticate.create_token);
// GET /auth/tokens para validar un token que sera oauth lo mas seguro y obtener informacion
// HEAD /auth/tokens para validar un token que sera oauth lo mas seguro sin mas 
// DELETE /auth/tokens para revoke a token

// Routes for applications
router.get('/v1/applications', 					apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.applications.index);
router.post('/v1/applications', 					apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.applications.create);
router.get('/v1/applications/:applicationId', 		apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.applications.info);
router.patch('/v1/applications/:applicationId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.applications.update);
router.delete('/v1/applications/:applicationId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.applications.delete);

// Routes for users
router.get('/v1/users', 					apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.users.index);
router.post('/v1/users', 					apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.users.create);
router.get('/v1/users/:userId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.users.info);
router.put('/v1/users/:userId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.users.update);
router.delete('/v1/users/:userId', 		apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.users.delete);

// Routes for organizations
router.get('/v1/organizations', 						apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.organizations.index);
router.post('/v1/organizations', 						apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.organizations.create);
router.get('/v1/organizations/:organizationsId', 		apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.organizations.info);
router.put('/v1/organizations/:organizationsId', 		apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.organizations.update);
router.delete('/v1/organizations/:organizationsId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.organizations.delete);

// Routes for roles
router.get('/v1/roles', 					apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.roles.index);
router.post('/v1/roles', 					apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.roles.create);
router.get('/v1/roles/:roleId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.roles.info);
router.patch('/v1/roles/:roleId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.roles.update);
router.delete('/v1/roles/:roleId', 		apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.roles.delete);

// Routes for permissions
router.get('/v1/permissions', 							apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.permissions.index);
router.post('/v1/permissions', 						apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.permissions.create);
router.get('/v1/permissions/:permissionId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.permissions.info);
router.patch('/v1/permissions/:permissionId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.permissions.update);
router.delete('/v1/permissions/:permissionId', 		apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.permissions.delete);

// Routes for pep_proxies
router.get('/v1/pep_proxies', 							apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.pep_proxies.index);
router.post('/v1/pep_proxies', 						apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.pep_proxies.create);
router.get('/v1/pep_proxies/:pep_proxyId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.pep_proxies.info);
router.patch('/v1/pep_proxies/:pep_proxyId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.pep_proxies.update);
router.delete('/v1/pep_proxies/:pep_proxyId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.pep_proxies.delete);

// Routes for iot_agents
router.get('/v1/iot_agents', 						apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.iot_agents.index);
router.post('/v1/iot_agents', 						apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.iot_agents.create);
router.get('/v1/iot_agents/:iot_agentId', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.iot_agents.info);
router.patch('/v1/iot_agents/:iot_agentId', 		apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.iot_agents.update);
router.delete('/v1/iot_agents/:iot_agentId', 		apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.iot_agents.delete);

// Routes for role_permission_assignments
router.get('/v1/role_permission_assignments/:role_id/permissions', 					apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.role_permission_assignments.index);
router.put('/v1/role_permission_assignments/:role_id/permissions/:permissionId', 		apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.role_permission_assignments.assign);
router.delete('/v1/role_permission_assignments/:role_id/permissions/:permissionId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.role_permission_assignments.remove);

// Routes for role_user_assignments
router.get('/v1/role_user_assignments/:role_id/users', 			apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.role_user_assignments.index);
router.put('/v1/role_user_assignments/:role_id/users/:userId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.role_user_assignments.assign);
router.delete('/v1/role_user_assignments/:role_id/users/:userId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.role_user_assignments.remove);

// Routes for role_organization_assignments
router.get('/v1/role_organization_assignments/:role_id/organizations', 					apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.role_organization_assignments.index);
router.put('/v1/role_organization_assignments/:role_id/organizations/:organizationId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.role_organization_assignments.assign);
router.delete('/v1/role_organization_assignments/:role_id/organizations/:organizationId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.role_organization_assignments.remove);

// Routes for user_organization_assignments
router.get('/v1/user_organization_assignments/:user_id/organizations', 					apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.user_organization_assignments.index);
router.put('/v1/user_organization_assignments/:user_id/organizations/:organizationId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.user_organization_assignments.assign);
router.delete('/v1/user_organization_assignments/:user_id/organizations/:organizationId', 	apiController.authenticate.validate_token, apiController.authenticate.is_user, apiController.user_organization_assignments.remove);

module.exports = router;
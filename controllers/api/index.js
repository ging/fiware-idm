module.exports = {
  authenticate: require('../../controllers/api/authenticate'),
  applications: require('../../controllers/api/applications'),
  roles: require('../../controllers/api/roles'),
  permissions: require('../../controllers/api/permissions'),
  pep_proxies: require('../../controllers/api/pep_proxies'),
  iot_agents: require('../../controllers/api/iot_agents'),
  users: require('../../controllers/api/users'),
  organizations: require('../../controllers/api/organizations'),
  check_permissions: require('../../controllers/api/check_permissions'),
  role_permission_assignments: require('../../controllers/api/role_permission_assignments'),
  role_user_assignments: require('../../controllers/api/role_user_assignments'),
  role_organization_assignments: require('../../controllers/api/role_organization_assignments'),
  user_organization_assignments: require('../../controllers/api/user_organization_assignments'),
  service_provider: require('../../controllers/api/service_provider'),
  authenticate_oauth: require('../../controllers/api/authenticate_oauth'),
  trusted_applications: require('../../controllers/api/trusted_applications')
};

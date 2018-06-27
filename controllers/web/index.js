module.exports = {
  admins: require('../../controllers/web/admins'),
  notifies: require('../../controllers/web/notifies'),
  applications: require('../../controllers/web/applications'),
  authorize_org_apps: require('../../controllers/web/authorize_org_apps'),
  authorize_user_apps: require('../../controllers/web/authorize_user_apps'),
  authzforces: require('../../controllers/web/authzforces'),
  check_permissions: require('../../controllers/web/check_permissions'),
  homes: require('../../controllers/web/homes'),
  roles: require('../../controllers/web/roles'),
  permissions: require('../../controllers/web/permissions'),
  pep_proxies: require('../../controllers/web/pep_proxies'),
  iot_agents: require('../../controllers/web/iot_agents'),
  users: require('../../controllers/web/users'),
  organizations: require('../../controllers/web/organizations'),
  manage_members: require('../../controllers/web/manage_members'),
  settings: require('../../controllers/web/settings'),
  sessions: require('../../controllers/web/sessions')
}
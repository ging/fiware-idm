'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('permission', [
          {
            id: '116ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Get and assign all internal application roles',
            oauth_client_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b' // 'idm_admin_app'
          },
          {
            id: '216ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Manage the application',
            oauth_client_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b' // 'idm_admin_app'
          },
          {
            id: '316ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Manage roles',
            oauth_client_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b' // 'idm_admin_app'
          },
          {
            id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Manage authorizations',
            oauth_client_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b' // 'idm_admin_app'
          },
          {
            id: '516ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Get and assign all public application roles',
            oauth_client_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b' // 'idm_admin_app'
          },
          {
            id: '616ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Get and assign only public owned roles',
            oauth_client_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b' // 'idm_admin_app'
          },
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('permission', null, {});
  }
};

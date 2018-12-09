'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([

      queryInterface.bulkInsert('permission', [
          {
            id: '1', //'116ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Get and assign all internal application roles',
            oauth_client_id: 'idm_admin_app'
          },
          {
            id: '2', //'216ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Manage the application',
            oauth_client_id: 'idm_admin_app'
          },
          {
            id: '3', //'316ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Manage roles',
            oauth_client_id: 'idm_admin_app'
          },
          {
            id: '4', //'416ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Manage authorizations',
            oauth_client_id: 'idm_admin_app'
          },
          {
            id: '5', //'516ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Get and assign all public application roles',
            oauth_client_id: 'idm_admin_app'
          },
          {
            id: '6', //'616ac246-e7ac-49ff-93b4-f7e94d997e6b',
            is_internal: true,
            name: 'Get and assign only public owned roles',
            oauth_client_id: 'idm_admin_app'
          },
        ]),
        // set sequence for postgres or "SELECT 1" for compatibility with mysql
        queryInterface.sequelize.query(
          ((queryInterface.sequelize.options.dialect == 'postgres') ? "SELECT setval('public.role_permission_id_seq', 10, true);" : "SELECT 1"),
          {type: Sequelize.QueryTypes.SELECT
        }),
      ])
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('permission', null, {});
  }
};

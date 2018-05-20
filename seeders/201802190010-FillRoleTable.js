'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('role', [
          {
            id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b', //'provider',
            is_internal: true,
            name: 'Provider',
            oauth_client_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b' //'idm_admin_app'
          },
          {
            id: '416ac246-e7ac-49ff-93b4-f7e94d997e61', //'purchaser',
            is_internal: true,
            name: 'Purchaser',
            oauth_client_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b' //'idm_admin_app'
          }
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('role', null, {});
  }
};

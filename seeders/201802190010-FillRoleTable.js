'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('role', [
      {
        id: 'provider',
        is_internal: true,
        name: 'Provider',
        oauth_client_id: 'idm_admin_app'
      },
      {
        id: 'purchaser',
        is_internal: true,
        name: 'Purchaser',
        oauth_client_id: 'idm_admin_app'
      }
    ]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('role', null, {});
  }
};

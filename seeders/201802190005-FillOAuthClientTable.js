'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('oauth_client', [
      {
        id: 'idm_admin_app',
        name: 'idm',
        description: 'idm',
        url: '',
        redirect_uri: '',
        grant_type: '',
        response_type: '',
        image: 'default'
      }
    ]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('oauth_client', null, {});
  }
};

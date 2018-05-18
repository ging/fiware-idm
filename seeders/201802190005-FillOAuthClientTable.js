'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('oauth_client', [
          {
            id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b', //'idm_admin_app', 
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

'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('oauth_client', [
      {
        id: '3771a537-84d4-4985-8cc3-bd24703138c3',
        secret: 'b20ae24c-cf1a-4d64-8cc8-00c6aaeb0f8b',
        name: 'iaacaas',
        description: 'iaacaas',
        url: 'http://localhost',
        redirect_uri: 'http://localhost/login',
        grant_type: 'authorization_code,implicit,password,client_credentials,refresh_token',
        response_type: 'code,token',
        image: 'default',
      },
    ]);
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('oauth_client', null, {});
  },
};

'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('pep_proxy', [
      {
        id: 'pep_proxy_0e2ff2c9-7bf4-46cd-81dd-58c871a27796',
        password: 'd7ae2119-2793-400d-9806-4d5cb2e3c74e',
        oauth_client_id: '3771a537-84d4-4985-8cc3-bd24703138c3',
      },
    ]);
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('pep_proxy', null, {});
  },
};

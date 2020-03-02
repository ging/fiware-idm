'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('pep_proxy', [
      {
        id: 'pep_proxy_bb676cb0-51d2-4016-aba5-48ea3af09801',
        password: '1d5a3fa85e75f14f21a287bbb53b3cf059bc7b59',
        oauth_client_id: '3771a537-84d4-4985-8cc3-bd24703138c3',
        salt: '86cc70908eb242f1',
      },
    ]);
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('pep_proxy', null, {});
  },
};

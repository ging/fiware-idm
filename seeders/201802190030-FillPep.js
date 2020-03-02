'use strict';

var crypto = require('crypto');
var salt = crypto
  .randomBytes(16)
  .toString('hex')
  .slice(0, 16);

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('pep_proxy', [
      {
        id: 'pep_proxy_0e2ff2c9-7bf4-46cd-81dd-58c871a27796',
        password: crypto
          .createHmac('sha1', salt)
          .update(process.env.IDM_ADMIN_PASS || 'd7ae2119-2793-400d-9806-4d5cb2e3c74e')
          .digest('hex'),
        oauth_client_id: '3771a537-84d4-4985-8cc3-bd24703138c3',
        salt: salt,
      },
    ]);
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('pep_proxy', null, {});
  },
};

'use strict';

var config = require('../config.js').password_encryption;

var crypto = require('crypto');
var key = config.key;

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('user', [
          {
            id:  (process.env.IDM_ADMIN_ID || 'admin'),
            username:  (process.env.IDM_ADMIN_USER || 'admin'),
            email: (process.env.IDM_ADMIN_EMAIL || "admin@test.com"),
            password: crypto.createHmac('sha1', key).update( (process.env.IDM_ADMIN_PASS ||'1234')).digest('hex'),
            date_password: new Date((new Date()).getTime()),
            enabled: true,
            admin: true
          }
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('user', null, {});
  }
};

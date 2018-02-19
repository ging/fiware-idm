'use strict';

var config = require('../config.js').password_encryption;

var crypto = require('crypto');
var key = config.key;

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('user', [
          {
            id: 'admin',
            username: 'admin',
            email: "admin@test.com",
            password: crypto.createHmac('sha1', key).update('1234').digest('hex'),
            date_password: new Date((new Date()).getTime()),
            enabled: 1, 
            admin: 1
          }
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('user', null, {});
  }
};

'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('role_permission', [
          {
            role_id: 'provider',  
            permission_id: '1'
          },
          {
            role_id: 'provider',  
            permission_id: '2'
          },
          {
            role_id: 'provider',  
            permission_id: '3'
          },
          {
            role_id: 'provider',  
            permission_id: '4'
          },
          {
            role_id: 'provider',  
            permission_id: '5'
          },
          {
            role_id: 'provider',  
            permission_id: '6'
          },
          {
            role_id: 'purchaser', 
            permission_id: '5'
          }
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('role_permission', null, {});
  }
};
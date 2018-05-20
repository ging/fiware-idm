'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('role_permission', [
          {
            id: '1',
            role_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b', //'provider',
            permission_id: '1'
          },
          {
            id: '2',
            role_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b', //'provider',
            permission_id: '2'
          },
          {
            id: '3',
            role_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b', //'provider',
            permission_id: '3'
          },
          {
            id: '4',
            role_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b', //'provider',
            permission_id: '4'
          },
          {
            id: '5',
            role_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b', //'provider',
            permission_id: '5'
          },
          {
            id: '6',
            role_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b', //'provider',
            permission_id: '6'
          },
          {
            id: '7',
            role_id: '416ac246-e7ac-49ff-93b4-f7e94d997e61', //'purchaser', 
            permission_id: '5'
          }
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('role_permission', null, {});
  }
};

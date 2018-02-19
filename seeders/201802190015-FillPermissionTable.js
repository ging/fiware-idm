'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('permission', [
          {
            id: '1', 
            is_internal: 1, 
            name: 'Get and assign all internal application roles',  
            oauth_client_id: 'idm_admin_app'
          },
          {
            id: '2', 
            is_internal: 1, 
            name: 'Manage the application',
            oauth_client_id: 'idm_admin_app'
          },
          {
            id: '3', 
            is_internal: 1, 
            name: 'Manage roles',
            oauth_client_id: 'idm_admin_app'},
          {
            id: '4', 
            is_internal: 1, 
            name: 'Manage authorizations',
            oauth_client_id: 'idm_admin_app'},
          {
            id: '5', 
            is_internal: 1, 
            name: 'Get and assign all public application roles',
            oauth_client_id: 'idm_admin_app'},
          {
            id: '6', 
            is_internal: 1, 
            name: 'Get and assign only public owned roles',
            oauth_client_id: 'idm_admin_app'
          },
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('permission', null, {});
  }
};
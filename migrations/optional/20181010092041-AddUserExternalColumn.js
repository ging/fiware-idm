  'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('oauth_access_token', 'ext_user_id', {
        type: Sequelize.STRING,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }),
      queryInterface.addColumn('oauth_authorization_code', 'ext_user_id', {
        type: Sequelize.STRING,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }),
      queryInterface.addColumn('oauth_refresh_token', 'ext_user_id', {
        type: Sequelize.STRING,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('oauth_access_token', 'ext_user_id'),
      queryInterface.removeColumn('oauth_authorization_code', 'ext_user_id'),
      queryInterface.removeColumn('oauth_refresh_token', 'ext_user_id')
    ])
  }
};

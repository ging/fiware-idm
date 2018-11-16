'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint('oauth_access_token', ['refresh_token'], {
        type: 'foreign key',
        name: 'refresh_token',
        onDelete: 'CASCADE',
        references: {
          table: 'oauth_refresh_token',
          field: 'refresh_token'
        }
      }),
      queryInterface.addColumn('oauth_access_token', 'authorization_code', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('oauth_refresh_token', 'authorization_code', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('oauth_refresh_token', 'valid', {
        type: Sequelize.BOOLEAN,
        defaultValue: null
      }),
      queryInterface.addConstraint('oauth_access_token', ['authorization_code'], {
        type: 'foreign key',
        name: 'authorization_code_at',
        onDelete: 'CASCADE',
        references: {
          table: 'oauth_authorization_code',
          field: 'authorization_code'
        }
      }),
      queryInterface.addConstraint('oauth_refresh_token', ['authorization_code'], {
        type: 'foreign key',
        name: 'authorization_code_rt',
        onDelete: 'CASCADE',
        references: {
          table: 'oauth_authorization_code',
          field: 'authorization_code'
        }
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint('oauth_access_token', 'refresh_token'),
      queryInterface.removeColumn('oauth_access_token', 'authorization_code'),
      queryInterface.removeColumn('oauth_refresh_token', 'authorization_code'),
      queryInterface.removeColumn('oauth_refresh_token', 'valid')
    ])
  }
};
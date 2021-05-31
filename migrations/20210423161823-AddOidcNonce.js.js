'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('oauth_authorization_code', 'nonce', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('oauth_authorization_code', 'nonce');
  }
};

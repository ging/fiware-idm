'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('permission', 'use_authorization_service_header', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('permission', 'use_authorization_service_header')
};

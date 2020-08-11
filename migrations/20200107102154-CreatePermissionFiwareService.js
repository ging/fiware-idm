'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('permission', 'fiware_service', {
      type:
        Sequelize.STRING(255) +
        (queryInterface.sequelize.dialect === 'mysql'
          ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
          : ''),
    }),
  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn('permission', 'fiware_service'),
};

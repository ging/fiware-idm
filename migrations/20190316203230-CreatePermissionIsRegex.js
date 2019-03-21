'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('permission', 'isRegex', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }),
  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn('permission', 'isRegex'),
};

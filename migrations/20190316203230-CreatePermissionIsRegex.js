'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('permission', 'is_regex', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }),
  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn('permission', 'is_regex'),
};

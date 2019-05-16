'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'role_usage_policy',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        role_id: {
          type: Sequelize.STRING(36),
          onDelete: 'CASCADE',
          references: {
            model: 'role',
            key: 'id',
          },
        },
        usage_policy_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'usage_policy',
            key: 'id',
          },
        },
      },
      {
        sync: { force: true },
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('role_usage_policy');
  },
};

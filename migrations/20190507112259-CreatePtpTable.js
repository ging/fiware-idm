'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'ptp',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        previous_job_id: {
          type: Sequelize.STRING,
          primaryKey: true,
        },
        oauth_client_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'oauth_client',
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
    return queryInterface.dropTable('ptp');
  },
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'trusted_application',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        oauth_client_id: {
          type: Sequelize.STRING(36), // Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'oauth_client',
            key: 'id',
          },
        },
        trusted_oauth_client_id: {
          type: Sequelize.STRING(36), // Sequelize.UUID,
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
    return queryInterface.dropTable('trusted_application');
  },
};

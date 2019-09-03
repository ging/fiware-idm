module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'authzforce',
      {
        az_domain: {
          type: Sequelize.STRING,
          primaryKey: true,
        },
        policy: {
          type: Sequelize.UUID,
        },
        version: {
          type: Sequelize.INTEGER,
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

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('authzforce');
  },
};

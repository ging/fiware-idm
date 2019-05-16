module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'role_assignment',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        role_organization: {
          type: Sequelize.STRING,
        },
        oauth_client_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'oauth_client',
            key: 'id',
          },
        },
        role_id: {
          type: Sequelize.STRING(36),
          onDelete: 'CASCADE',
          references: {
            model: 'role',
            key: 'id',
          },
        },
        organization_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'organization',
            key: 'id',
          },
        },
        user_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'user',
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
    return queryInterface.dropTable('role_assignment');
  },
};

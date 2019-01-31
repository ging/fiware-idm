module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'oauth_access_token',
      {
        access_token: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        expires: Sequelize.DATE,
        scope: Sequelize.STRING,
        refresh_token: Sequelize.STRING,
        valid: Sequelize.BOOLEAN,
        extra: Sequelize.JSON,
        oauth_client_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'oauth_client',
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
        iot_id: {
          type: Sequelize.STRING,
          onDelete: 'CASCADE',
          references: {
            model: 'iot',
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
    return queryInterface.dropTable('oauth_access_token');
  },
};

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'oauth_authorization_code',
      {
        authorization_code: {
          type: Sequelize.STRING(256),
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        expires: Sequelize.DATE,
        redirect_uri: Sequelize.STRING(2000),
        scope: Sequelize.STRING,
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
      },
      {
        sync: { force: true },
      }
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('oauth_authorization_code');
  },
};

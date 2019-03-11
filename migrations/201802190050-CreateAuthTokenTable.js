module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'auth_token',
      {
        access_token: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        expires: Sequelize.DATE,
        valid: Sequelize.BOOLEAN,
        user_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'user',
            key: 'id',
          },
        },
        pep_proxy_id: {
          type: Sequelize.STRING,
          onDelete: 'CASCADE',
          references: {
            model: 'pep_proxy',
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
    return queryInterface.dropTable('auth_token');
  },
};

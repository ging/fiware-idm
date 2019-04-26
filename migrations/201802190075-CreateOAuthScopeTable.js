module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'oauth_scope',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        scope: Sequelize.STRING,
        is_default: Sequelize.BOOLEAN,
      },
      {
        sync: { force: true },
      }
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('oauth_scope');
  },
};

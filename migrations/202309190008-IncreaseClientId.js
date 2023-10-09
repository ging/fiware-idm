module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'oauth_client',
      'id',
      {
          type: Sequelize.STRING(255), 
          unique: true,
          primaryKey: true,
      }).then(() =>
      queryInterface.changeColumn('oauth_access_token', 'oauth_client_id', 
      {
        type: Sequelize.STRING(255), 
        onDelete: 'CASCADE',
        references: {
          model: 'oauth_client',
          key: 'id',
        },
      })
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'oauth_client',
      'id',
      {
          type: Sequelize.STRING(36), 
          unique: true,
          primaryKey: true,
      });
  },
};

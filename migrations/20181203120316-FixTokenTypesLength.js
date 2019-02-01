module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('oauth_client', 'token_types', {
      type: Sequelize.STRING(2000),
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('oauth_client', 'token_types', {
      type: Sequelize.STRING(15),
    });
  },
};

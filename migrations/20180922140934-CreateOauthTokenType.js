module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('oauth_client', 'token_type', {
        type: Sequelize.STRING(15),
        defaultValue: 'bearer',
      }),
      queryInterface.addColumn('oauth_client', 'jwt_secret', {
        type: Sequelize.STRING,
        defaultValue: null,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('oauth_client', 'token_type'),
      queryInterface.removeColumn('oauth_client', 'jwt_secret'),
    ]);
  },
};

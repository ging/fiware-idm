module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('oauth_client', 'redirect_sign_out_uri', {
        type:
          Sequelize.STRING(2000) +
          (queryInterface.sequelize.dialect === 'mysql'
            ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
            : ''),
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('oauth_client', 'redirect_sign_out_uri'),
    ]);
  },
};

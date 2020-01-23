module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user', 'eidas_id', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user', 'eidas_id');
  },
};

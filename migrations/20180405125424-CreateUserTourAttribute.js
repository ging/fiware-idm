module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user', 'starters_tour_ended', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user', 'starters_tour_ended');
  },
};

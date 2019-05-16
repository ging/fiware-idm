module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('eidas_credentials', 'sp_type', {
        type: Sequelize.STRING(255),
        validate: {
          notIn: {
            args: [['public', 'private']],
            msg: 'sp_type',
          },
        },
        defaultValue: 'private',
      }),
      queryInterface.addColumn('eidas_credentials', 'attributes_list', {
        type: Sequelize.TEXT(),
        get() {
          return this.getDataValue('attributes_list')
            ? JSON.parse(this.getDataValue('attributes_list'))
            : {};
        },
        set(val) {
          this.setDataValue('attributes_list', JSON.stringify(val));
        },
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('eidas_credentials', 'sp_type'),
      queryInterface.removeColumn('eidas_credentials', 'attributes_list'),
    ]);
  },
};

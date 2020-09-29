'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'user_authorized_application',
        'shared_attributes',
        {
          type: Sequelize.STRING,
          get() {
            return this.getDataValue('shared_attributes')
              ? this.getDataValue('shared_attributes').split(',')
              : [];
          },
          set(val) {
            this.setDataValue('shared_attributes', val.join(','));
          },
        }
      ),
      queryInterface.addColumn('user_authorized_application', 'login_date', {
        type: Sequelize.DATE,
        value: Sequelize.NOW,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'user_authorized_application',
        'shared_attributes'
      ),
      queryInterface.removeColumn('user_authorized_application', 'login_date'),
    ]);
  },
};

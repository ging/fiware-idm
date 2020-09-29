'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('user_registration_profile', 'disable_2fa_key', {
        type: Sequelize.STRING,
        defaultValue: undefined,
      }),
      queryInterface.addColumn(
        'user_registration_profile',
        'disable_2fa_expires',
        {
          type: Sequelize.DATE,
          defaultValue: undefined,
        }
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'user_registration_profile',
        'disable_2fa_key'
      ),
      queryInterface.removeColumn(
        'user_registration_profile',
        'disable_2fa_expires'
      ),
    ]);
  },
};

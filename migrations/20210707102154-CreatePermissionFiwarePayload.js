'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('permission', 'authorization_id_header', {
        type:
          Sequelize.STRING(255) +
          (queryInterface.sequelize.dialect === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      }),
      queryInterface.addColumn('permission', 'authorization_attributes_header', {
        type:
          Sequelize.STRING(255) +
          (queryInterface.sequelize.dialect === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      }),
      queryInterface.addColumn('permission', 'authorization_types_header', {
        type:
          Sequelize.STRING(255) +
          (queryInterface.sequelize.dialect === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('permission', 'authorization_id_header'),
      queryInterface.removeColumn('permission', 'authorization_attributes_header'),
      queryInterface.removeColumn('permission', 'authorization_types_header'),
    ]);
  },
};
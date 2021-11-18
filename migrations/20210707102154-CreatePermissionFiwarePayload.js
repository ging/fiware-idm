'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('permission', 'regex_entity_ids', {
        type:
          Sequelize.STRING(255) +
          (queryInterface.sequelize.dialect === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      }),
      queryInterface.addColumn('permission', 'regex_attributes', {
        type:
          Sequelize.STRING(255) +
          (queryInterface.sequelize.dialect === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      }),
      queryInterface.addColumn('permission', 'regex_types', {
        type:
          Sequelize.STRING(255) +
          (queryInterface.sequelize.dialect === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('permission', 'regex_entity_ids'),
      queryInterface.removeColumn('permission', 'regex_attributes'),
      queryInterface.removeColumn('permission', 'regex_types'),
    ]);
  },
};
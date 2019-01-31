module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'permission',
      {
        id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          //defaultValue: Sequelize.UUIDV4,
          unique: true,
          primaryKey: true,
        },
        name: {
          type:
            Sequelize.STRING(255) +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: {
            notEmpty: { msg: 'error_empty_name' },
          },
        },
        description: {
          type:
            Sequelize.TEXT() +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: {
            notEmpty: { msg: 'error_empty_description' },
          },
        },
        is_internal: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        action: {
          type:
            Sequelize.STRING(255) +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
        },
        resource: {
          type:
            Sequelize.STRING(255) +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
        },
        xml: {
          type:
            Sequelize.TEXT() +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
        },
        oauth_client_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'oauth_client',
            key: 'id',
          },
        },
      },
      {
        sync: { force: true },
      }
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('permission');
  },
};

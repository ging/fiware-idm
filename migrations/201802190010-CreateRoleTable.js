module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'role',
      {
        id: {
          type: Sequelize.STRING(36),
          // defaultValue: Sequelize.UUIDV4,
          unique: true,
          primaryKey: true,
        },
        name: {
          type:
            Sequelize.STRING(64) +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: {
            notEmpty: { msg: 'error_empty_name' },
          },
        },
        is_internal: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
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
    return queryInterface.dropTable('role');
  },
};

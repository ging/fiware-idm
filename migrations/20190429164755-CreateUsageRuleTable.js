'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'usage_policy',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
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
        type: {
          type: Sequelize.ENUM('COUNT_POLICY', 'AGGREGATION_POLICY', 'CUSTOM'),
        },
        parameters: {
          type: Sequelize.JSON(),
          validate: {
            isAllow(value, next) {
              const self = this;
              for (var key in self.parameters) {
                if (!allowed_rules[self.type].parameters.includes(key)) {
                  return next('invalidParameter');
                }
              }
              return next();
            },
          },
        },
        punishment: {
          type: Sequelize.ENUM('KILL_JOB', 'UNSUBSCRIBE', 'MONETIZE'),
        },
        from: {
          type: Sequelize.TIME(),
        },
        to: {
          type: Sequelize.TIME(),
        },
        odrl: {
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

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('usage_policy');
  },
};

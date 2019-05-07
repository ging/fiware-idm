'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'usage_policy',
      {
        id: {
          type: Sequelize.STRING(36),
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        name: {
          type:
            Sequelize.STRING(255) +
            (queryInterface.sequelize.getDialect() === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: {
            notEmpty: { msg: 'error_empty_name' },
          },
        },
        description: {
          type:
            Sequelize.TEXT() +
            (queryInterface.sequelize.getDialect() === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: {
            notEmpty: { msg: 'error_empty_description' },
          },
        },
        type: {
          type: Sequelize.ENUM(
            'COUNT_POLICY',
            'AGGREGATION_POLICY',
            'CUSTOM_POLICY'
          ),
          validate: {
            notEmpty: { msg: 'error_empty_type' },
            isAllow(value, next) {
              const self = this;
              if (self.type) {
                if (
                  ![
                    'COUNT_POLICY',
                    'AGGREGATION_POLICY',
                    'CUSTOM_POLICY',
                  ].includes(self.type)
                ) {
                  return next('error_invalid_type');
                }
              }
              return next();
            },
          },
        },
        parameters: {
          type: Sequelize.JSON(),
          validate: {
            isAllow(value, next) {
              const self = this;
              for (var key in self.parameters) {
                if (!allowed_rules[self.type].parameters.includes(key)) {
                  return next('error_invalid_parameter');
                }
              }
              return next();
            },
          },
        },
        punishment: {
          type: Sequelize.ENUM('KILL_JOB', 'UNSUBSCRIBE', 'MONETIZE'),
          validate: {
            isAllow(value, next) {
              const self = this;
              if (self.type && self.type !== 'CUSTOM_POLICY') {
                if (
                  !['KILL_JOB', 'UNSUBSCRIBE', 'MONETIZE'].includes(
                    self.punishment
                  )
                ) {
                  return next('error_invalid_punishment');
                }
              }
              return next();
            },
          },
        },
        from: {
          type: Sequelize.TIME,
        },
        to: {
          type: Sequelize.TIME,
        },
        odrl: {
          type:
            Sequelize.TEXT() +
            (queryInterface.sequelize.getDialect() === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: {
            isAllow(value, next) {
              const self = this;
              if (self.type && self.type === 'CUSTOM_POLICY') {
                if (self.parameters || !self.odrl) {
                  return next('error_invalid_custom');
                }
              }
              return next();
            },
          },
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

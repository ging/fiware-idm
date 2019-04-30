// Usage Policies model
const allowed_rules = require('../etc/data_usage/rule_parameters');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Usage_Policy',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type:
          DataTypes.STRING(255) +
          (sequelize.getDialect() === 'mysql'
            ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
            : ''),
        validate: {
          notEmpty: { msg: 'error_empty_name' },
        },
      },
      description: {
        type:
          DataTypes.TEXT() +
          (sequelize.getDialect() === 'mysql'
            ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
            : ''),
        validate: {
          notEmpty: { msg: 'error_empty_description' },
        },
      },
      type: {
        type: DataTypes.ENUM('COUNT_POLICY', 'AGGREGATION_POLICY', 'CUSTOM'),
      },
      parameters: {
        type: DataTypes.JSON(),
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
        type: DataTypes.ENUM('KILL_JOB', 'UNSUBSCRIBE', 'MONETIZE'),
      },
      from: {
        type: DataTypes.TIME,
      },
      to: {
        type: DataTypes.TIME,
      },
      odrl: {
        type:
          DataTypes.TEXT() +
          (sequelize.getDialect() === 'mysql'
            ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
            : ''),
      },
    },
    {
      tableName: 'usage_policy',
      timestamps: false,
      underscored: true,
    }
  );
};

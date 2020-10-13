// Permission model

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Permission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type:
          DataTypes.STRING(255) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: {
          notEmpty: { msg: 'error_empty_name' }
        }
      },
      description: {
        type:
          DataTypes.TEXT() + (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: {
          notEmpty: { msg: 'error_empty_description' }
        }
      },
      is_internal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      action: {
        type:
          DataTypes.STRING(255) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      },
      resource: {
        type:
          DataTypes.STRING(255) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      },
      authorization_service_header: {
        type:
          DataTypes.STRING(255) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      },
      use_authorization_service_header: {
        type:
          DataTypes.BOOLEAN() +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        allowNull: false,
        default: false
      },
      is_regex: {
        type:
          DataTypes.BOOLEAN() +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        allowNull: false,
        default: false
      },
      xml: {
        type:
          DataTypes.TEXT() + (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      }
    },
    {
      tableName: 'permission',
      timestamps: false,
      underscored: true
    }
  );
};

// Role model

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.STRING(36),
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true
      },
      name: {
        type:
          DataTypes.STRING(64) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: {
          notEmpty: { msg: 'error_empty_name' }
        }
      },
      is_internal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      tableName: 'role',
      timestamps: false,
      underscored: true
    }
  );
};

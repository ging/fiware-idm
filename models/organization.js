// Organization Model
module.exports = function (sequelize, DataTypes) {
  const Organization = sequelize.define(
    'Organization',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: {
        type:
          DataTypes.STRING(64) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: { notEmpty: { msg: 'name' } }
      },
      description: {
        type:
          DataTypes.TEXT() + (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: { notEmpty: { msg: 'description' } }
      },
      website: {
        type:
          DataTypes.STRING(2000) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      },
      image: {
        type: DataTypes.STRING,
        defaultValue: 'default'
      }
    },
    {
      tableName: 'organization',
      timestamps: false,
      underscored: true
    }
  );

  return Organization;
};

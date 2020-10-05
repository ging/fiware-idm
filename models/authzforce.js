// Authzforce model

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Authzforce',
    {
      az_domain: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      policy: {
        type: DataTypes.UUID
      },
      version: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: 'authzforce',
      timestamps: false,
      underscored: true
    }
  );
};

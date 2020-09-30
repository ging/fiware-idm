module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'trusted_application',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    },
    {
      tableName: 'trusted_application',
      timestamps: false,
      underscored: true
    }
  );
};

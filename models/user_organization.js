// Model that define relation between roles, users and permissions

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'User_Organization',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      role: {
        type: DataTypes.STRING(10)
      }
    },
    {
      tableName: 'user_organization',
      timestamps: false,
      underscored: true
    }
  );
};

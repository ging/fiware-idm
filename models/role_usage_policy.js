// Model that define relation between roles, users and permissions

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Role_Usage_Policy',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    },
    {
      tableName: 'role_usage_policy',
      timestamps: false,
      underscored: true
    }
  );
};

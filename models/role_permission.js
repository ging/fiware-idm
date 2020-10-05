// Model that define relation between roles, users and permissions

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Role_Permission',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    },
    {
      tableName: 'role_permission',
      timestamps: false,
      underscored: true
    }
  );
};

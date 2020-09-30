// Model that define relation between roles, users and permissions

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Role_Assignment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      role_organization: {
        type: DataTypes.STRING
      }
    },
    {
      tableName: 'role_assignment',
      timestamps: false,
      underscored: true
    }
  );
};

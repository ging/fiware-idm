// Model that define relation between roles, users and permissions

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Role_Permission',
    {
    	id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      }
    }, {
      tableName: 'role_permission',
      timestamps: false,
      underscored: true,
    } 
  );
}

// Model that define relation between roles, users and permissions

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Role_Assignment',
    { 
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    authorized: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        primaryKey: false
    }, role_organization: {
        type: DataTypes.STRING
    }
    }, {
	    tableName: 'role_assignment',
	    timestamps: false,
	    underscored: true,
  	});
}
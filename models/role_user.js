// Model that define relation between roles, users and permissions

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Role_User',
    { authorized: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        primaryKey: false
    }
    }, {
	    tableName: 'role_user',
	    timestamps: false,
	    underscored: true,
  	});
}
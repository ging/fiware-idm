// Model that define relation between roles, users and permissions

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Role_User',
    { }, {
	    tableName: 'role_user',
	    timestamps: false,
	    underscored: true,
  	});
}
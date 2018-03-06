// Model that define relation between users that has authorized applciation to see theirs data

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'User_Authorized_Application',
    { 
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    }, {
	    tableName: 'user_authorized_application',
	    timestamps: false,
	    underscored: true,
  	});
}
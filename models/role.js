// Role model

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Role',
    { id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }, name: {
        type: DataTypes.STRING,
        validate: { 
            notEmpty: {msg: "error_empty_name"}
        }
    }, is_internal: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
    }
    }, {
        tableName: 'role',
        timestamps: false,
        underscored: true,
    } 
  );
}
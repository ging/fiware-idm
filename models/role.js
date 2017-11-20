// Role model

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Role',
    { id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }, name: {
        type: DataTypes.STRING(64) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
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

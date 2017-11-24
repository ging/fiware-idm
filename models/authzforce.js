// Authzforce model

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Authzforce',
    { id: {
        type: DataTypes.UUID,
        primaryKey: true
    }, policy: {
        type: DataTypes.STRING(64),
    }, version: {
        type: DataTypes.INTEGER
    }
    }, {
        tableName: 'authzforce',
        timestamps: false,
        underscored: true,
    } 
  );
}

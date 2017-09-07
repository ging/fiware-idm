
// Definicion del modelo de las aplicaciones

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Applications',
    { Name: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "name"}}
    }, Description: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "description"}}
    }, ApplicationId: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "applicationId"}}
    }, ApplicationSecret: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "applicationSecret"}}
    }
  });
}
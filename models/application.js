// Application model

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Application',
    { id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }, name: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "name"}}
    }, description: {
        type: DataTypes.TEXT,
        validate: { notEmpty: {msg: "description"}}
    }, url: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "url"}}
    }, callbackurl: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "callbackurl"}}
    }, secret: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    }, client_type: {
        type: DataTypes.STRING
    }, grant_type: {
        type: DataTypes.STRING
    }, response_type: {
        type: DataTypes.STRING
    }, scope: {
        type: DataTypes.STRING
    }, extra: {
        type: DataTypes.JSON
    }
  });
}
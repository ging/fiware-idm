// Permission model

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Permission',
    { id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }, name: {
        type: DataTypes.STRING,
        validate: { 
            notEmpty: {msg: "namePerm"}
        }
    }, is_internal: {
        type: DataTypes.BOOLEAN
    }, action: {
        type: DataTypes.STRING,
        validate: { 
            notEmpty: {msg: "nameAct"}
        }
    }, resource: {
        type: DataTypes.STRING,
        validate: { 
            notEmpty: {msg: "nameRes"}
        }
    }, xml: {
        type:  DataTypes.TEXT
    }
  });
}
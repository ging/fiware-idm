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
            notEmpty: {msg: "error_empty_name"}
        }
    }, description: {
        type: DataTypes.TEXT,
        validate: { 
            notEmpty: {msg: "error_empty_description"}
        }
    }, is_internal: {
        type: DataTypes.BOOLEAN
    }, action: {
        type: DataTypes.STRING,
        validate: { 
            notEmpty: {msg: "error_empty_action"}
        }
    }, resource: {
        type: DataTypes.STRING,
        validate: { 
            notEmpty: {msg: "error_empty_resource"}
        }
    }, xml: {
        type: DataTypes.TEXT
    }
    }, {
        tableName: 'permission',
        timestamps: false,
        underscored: true,
    }
  );
}
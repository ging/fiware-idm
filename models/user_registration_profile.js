// User Registration Profile model 

module.exports = function(sequelize, DataTypes) {
    var User_Registration_Profile = sequelize.define(
        'User_Registration_Profile', 
        { 
            id: {
                        type: Sequelize.UUID,
                        primaryKey: true,
                        defaultValue: Sequelize.UUIDV4
            }
            activation_key: {
                type: DataTypes.STRING
            }, activation_expires: {
                type: DataTypes.DATE
            }, reset_key : {
                type: DataTypes.STRING,
                defaultValue: undefined
            }, reset_expires : {
                type: DataTypes.DATE,
                defaultValue: undefined
            }, verification_key : {
                type: DataTypes.STRING,
                defaultValue: undefined
            }, verification_expires : {
                type: DataTypes.DATE,
                defaultValue: undefined
            }
        }
        }, {
            tableName: 'user_registration_profile',
            timestamps: false,
            underscored: true
        } 
    );

    return User_Registration_Profile;
}
// User model
var config = require('../config.js');
var external_auth = config.external_auth;

// Vars for encrypting
var crypto = require('crypto');
var key = external_auth.password_encryption_key;
const bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
    var User_Ext = sequelize.define(
        'User_Ext',
        { id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        }, username: {
            type: DataTypes.STRING(64), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
            validate: { notEmpty: {msg: "username"}}
        }, email: {
            type: DataTypes.STRING,
            unique: true,
        }, password_salt: {
            type: DataTypes.STRING
        }, password: {
            type: DataTypes.STRING(40),
            validate: { notEmpty: {msg: "password1"}},
        }
        }, {
            tableName: external_auth.database.user_table,
            timestamps: false,
            underscored: true
        }
    );

    User_Ext.prototype.verifyPassword = function(password) {
        var valid_pass;

        switch (external_auth.password_encryption) {
            case 'sha1':
                var encripted = crypto.createHmac('sha1', (this.password_salt) ? this.password_salt : key).update(password).digest('hex');
                valid_pass = encripted === this.password;
                break;
            case 'bcrypt':
                valid_pass = bcrypt.compareSync(password, this.password);
                console.log('entrooooooooooooooooo', bcrypt.compareSync(password, this.password));
                break;
            default:
                valid_pass = false;

        }
        console.log('aaaaaaaaaaaaaaa', external_auth.password_encryption, password, this.password, valid_pass);
        return valid_pass;
    }

    return User_Ext;
}

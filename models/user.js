// User model
var config = require('../config.js');

// Vars for encrypting
var crypto = require('crypto');
var key = config.password_encryption.key;

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define(
        'User',
        { id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        }, username: {
            type: DataTypes.STRING(64) + ((sequelize.getDialect() == 'mysql')?' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci':''),
            validate: { notEmpty: {msg: "username"}}
        }, description: {
            type: DataTypes.TEXT()  + ((sequelize.getDialect() == 'mysql')?' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci':'')
        }, website: {
            type: DataTypes.STRING(2000)  + ((sequelize.getDialect() == 'mysql')?' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci':'')
        }, image: {
            type: DataTypes.STRING,
            defaultValue: 'default'
        }, gravatar: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }, email: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                notEmpty: {msg: "email"},
                isEmail: {msg: "emailInvalid"},
                isUnique: function (value, next) {
                    var self = this;
                    User.find({where: {email: value}})
                    .then(function (user) {
                            if (user && self.id !== user.id) {
                                return next('emailUsed');
                            }
                            return next();
                    })
                    .catch(function (err) {
                        return next(err);
                    });
                }
            }
        }, salt: {
            type: DataTypes.STRING
        }, password: {
            type: DataTypes.STRING(40),
            validate: { notEmpty: {msg: "password1"}},
            set: function (password) {

                var salt = crypto.randomBytes(16).toString('hex').slice(0,16)

                var encripted = crypto.createHmac('sha1', salt).update(password).digest('hex');
                // Evita passwords vacíos
                if (password === '') {
                    encripted = '';
                }
                this.setDataValue('salt', salt);
                this.setDataValue('password', encripted);
            }
        }, date_password: {
            type: DataTypes.DATE
        }, enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }, admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }, starters_tour_ended: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }, eidas_id: {
            type: DataTypes.STRING,
            defaultValue: null
        }, extra: {
            type: DataTypes.JSON
        }, scope: {
            type: DataTypes.STRING(2000),
            get: function () {
              return (this.getDataValue('scope')) ? this.getDataValue('scope').split(',') : []
            },
            set: function (val) {
              this.setDataValue('scope', (val) ? val.toString() : null)
            }
        }
        }, {
            tableName: 'user',
            timestamps: false,
            underscored: true
        }
    );

    User.prototype.verifyPassword = function(password) {
        var encripted = crypto.createHmac('sha1', (this.salt) ? this.salt : key).update(password).digest('hex');
        return encripted === this.password;
    }

    return User;
}

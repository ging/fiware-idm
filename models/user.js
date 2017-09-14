// User model 


// Vars for encrypting
var crypto = require('crypto');
var key = 'paldflmarfijnakjdakldsfmal';

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define(
        'User', 
        { id: {
            type: DataTypes.STRING,
            primaryKey: true
        }, username: {
            type: DataTypes.STRING,
            validate: { 
                notEmpty: {msg: "username"},
            }
        }, email: {
            type: DataTypes.STRING,
            unique: true,
            validate: { 
                notEmpty: {msg: "email"},
                isEmail: {msg: "email"},
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
        }, password: {
            type: DataTypes.STRING,
            validate: { notEmpty: {msg: "password1"}},
            set: function (password) {
                var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
                // Evita passwords vacíos
                if (password === '') {
                    encripted = '';
                }
                this.setDataValue('password', encripted);
            }
        }, enabled: {
            type: DataTypes.BOOLEAN
        }, extra: {
            type: DataTypes.JSON
        }
    });

    User.prototype.verifyPassword = function(password) {
        var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
        return encripted === this.password;
    }

    return User;
}
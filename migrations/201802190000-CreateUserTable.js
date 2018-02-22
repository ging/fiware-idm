'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('user',
            {
               id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                }, username: {
                    type: Sequelize.STRING(64) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                    validate: { notEmpty: {msg: "username"}}
                }, description: {
                    type: Sequelize.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
                }, website: {
                    type: Sequelize.STRING(2000) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
                }, image: {
                    type: Sequelize.STRING,
                    defaultValue: 'default'
                }, gravatar: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                }, email: {
                    type: Sequelize.STRING,
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
                    type: Sequelize.STRING(40),
                    validate: { notEmpty: {msg: "password1"}},
                    set: function (password) {
                        var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
                        // Evita passwords vacíos
                        if (password === '') {
                            encripted = '';
                        }
                        this.setDataValue('password', encripted);
                    }
                }, date_password: {
                    type: Sequelize.DATE
                }, enabled: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                }, admin: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                }, extra: {
                    type: Sequelize.STRING
                }, scope: {
                    type: Sequelize.STRING(80)
                } 
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('user');
    }
};
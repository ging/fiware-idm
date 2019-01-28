'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('organization',
            {
                id: {
                    type: Sequelize.STRING(36), //Sequelize.UUID,
                    primaryKey: true,
                    unique: true
                    //defaultValue: Sequelize.UUIDV4
                }, name: {
                    type: Sequelize.STRING(64) + ((sequelize.dialect == 'mysql')?' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci':''),
                    validate: { notEmpty: {msg: "name"}}
                }, description: {
                    type: Sequelize.TEXT() + ((sequelize.dialect == 'mysql')?' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci':''),
                    validate: { notEmpty: {msg: "description"}}
                }, website: {
                    type: Sequelize.STRING(2000)  + ((sequelize.dialect == 'mysql')?' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci':'')
                }, image: {
                    type: Sequelize.STRING,
                    defaultValue: 'default'
                }
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('organization');
    }
};

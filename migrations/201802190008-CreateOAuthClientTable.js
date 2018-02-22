'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('oauth_client',
            {
                id: {
                  type: Sequelize.UUID,
                  defaultValue: Sequelize.UUIDV4,
                  primaryKey: true
                }, name: {
                  type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "name"}}
                }, description: {
                  type: Sequelize.TEXT()  + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "description"}}
                }, secret: {
                  type: Sequelize.UUID,
                  defaultValue: Sequelize.UUIDV4
                }, url: {
                  type: Sequelize.STRING(2000)  + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "url"}}
                }, redirect_uri: {
                  type: Sequelize.STRING(2000)  + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "redirectUri"}}
                }, image: {
                  type: Sequelize.STRING,
                  defaultValue: 'default'
                },
                client_type: Sequelize.STRING(15), 
                grant_type: Sequelize.STRING(25), 
                response_type: Sequelize.STRING(5),
                scope: Sequelize.STRING(80),
                extra: Sequelize.JSON
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('oauth_client');
    }
};
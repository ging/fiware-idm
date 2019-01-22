'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('permission',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true
                }, name: {
                    type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                    validate: { 
                        notEmpty: {msg: "error_empty_name"}
                    }
                }, description: {
                    type: Sequelize.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                    validate: { 
                        notEmpty: {msg: "error_empty_description"}
                    }
                }, is_internal: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: 0
                }, action: {
                    type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
                }, resource: {
                    type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
                }, xml: {
                    type: Sequelize.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
                }, oauth_client_id: {
                    type: Sequelize.UUID,
                    onDelete: 'CASCADE',
                    references: {
                        model: 'oauth_client',
                        key: 'id'
                    }
                }
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('permission');
    }
};
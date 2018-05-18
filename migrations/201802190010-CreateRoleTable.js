'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('role',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true
                }, name: {
                    type: Sequelize.STRING(64), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                    validate: {
                        notEmpty: {msg: "error_empty_name"}
                    }
                }, is_internal: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
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
        return queryInterface.dropTable('role');
    }
};

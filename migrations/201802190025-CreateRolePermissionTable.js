'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('role_permission',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                role_id: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'role',
                        key: 'id'
                    }
                },
                permission_id: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'permission',
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
        return queryInterface.dropTable('role_permission');
    }
};
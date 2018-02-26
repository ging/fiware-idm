'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('role_permission',
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
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
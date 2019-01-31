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
                    type: Sequelize.STRING(36),
                    onDelete: 'CASCADE',
                    references: {
                        model: 'role',
                        key: 'id'
                    }
                },
                permission_id: {
                    type: Sequelize.STRING(36), //Sequelize.UUID,
                    onDelete: 'CASCADE',
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

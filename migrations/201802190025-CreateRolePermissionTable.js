'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('role_permission',
            {
                role_id: {
                    type: Sequelize.STRING
                },
                permission_id: {
                    type: Sequelize.STRING
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
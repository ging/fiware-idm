'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('role_assignment',
            {
                authorized: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                    primaryKey: false
                }, role_organization: {
                    type: Sequelize.STRING
                }
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('role_assignment');
    }
};
'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('authzforce',
            {
                az_domain: {
                    type: Sequelize.STRING,
                    primaryKey: true
                }, policy: {
                    type: Sequelize.UUID,
                }, version: {
                    type: Sequelize.INTEGER
                }
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('authzforce');
    }
};
'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('auth_token',
            {
                access_token: {
                  type: Sequelize.STRING,
                  primaryKey: true,
                  allowNull: false,
                  unique: true,
                },
                expires: Sequelize.DATE,
                valid: Sequelize.BOOLEAN
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('auth_token');
    }
};
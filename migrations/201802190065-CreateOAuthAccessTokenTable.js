'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('oauth_access_token',
            {
                access_token: {
                  type: Sequelize.STRING,
                  primaryKey: true,
                  allowNull: false,
                  unique: true,
                },
                expires: Sequelize.DATE,
                scope: Sequelize.STRING,
                refresh_token: Sequelize.STRING,
                valid: Sequelize.BOOLEAN,
                extra: Sequelize.JSON
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('oauth_access_token');
    }
};
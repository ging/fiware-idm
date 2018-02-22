'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('oauth_scope',
            {
                id: {
                  type: Sequelize.INTEGER,
                  autoIncrement: true,
                  primaryKey: true,
                  allowNull: false,
                  unique: true,
                },
                scope: Sequelize.STRING,
                is_default: Sequelize.BOOLEAN
            },
            {
                sync: {force: true}
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('oauth_scope');
    }
};
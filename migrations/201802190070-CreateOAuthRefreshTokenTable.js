    'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('oauth_refresh_token',
            {
                refresh_token: {
                  type: Sequelize.STRING(256),
                  primaryKey: true,
                  allowNull: false,
                  unique: true,
                },
                expires: Sequelize.DATE,
                scope: Sequelize.STRING,
                oauth_client_id: {
                    type: Sequelize.UUID,
                    onDelete: 'CASCADE',
                    references: {
                        model: 'oauth_client',
                        key: 'id'
                    }
                },
                user_id: {
                    type: Sequelize.UUID,
                    onDelete: 'CASCADE',
                    references: {
                        model: 'user',
                        key: 'id'
                    }
                },
                iot_id: {
                    type: Sequelize.STRING,
                    onDelete: 'CASCADE',
                    references: {
                        model: 'iot',
                        key: 'id'
                    }
                },
                pep_proxy_id: {
                    type: Sequelize.STRING,
                    onDelete: 'CASCADE',
                    references: {
                        model: 'pep_proxy',
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
        return queryInterface.dropTable('oauth_refresh_token');
    }
};
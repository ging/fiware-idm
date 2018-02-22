'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('role_assignment',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                authorized: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                },
                role_organization: {
                    type: Sequelize.STRING
                },
                oauth_client_id: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'oauth_client',
                        key: 'id'
                    }
                },
                role_id: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'role',
                        key: 'id'
                    }
                },
                organization_id: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'organization',
                        key: 'id'
                    }
                },
                user_id: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'user',
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
        return queryInterface.dropTable('role_assignment');
    }
};
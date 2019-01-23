'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'oauth_client',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        name: {
          type:
            Sequelize.STRING(255) +
            ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
          validate: { notEmpty: { msg: 'name' } },
        },
        description: {
          type:
            Sequelize.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
          validate: { notEmpty: { msg: 'description' } },
        },
        secret: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        url: {
          type:
            Sequelize.STRING(2000) +
            ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
          validate: { notEmpty: { msg: 'url' } },
        },
        redirect_uri: {
          type:
            Sequelize.STRING(2000) +
            ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
          validate: { notEmpty: { msg: 'redirectUri' } },
        },
        image: {
          type: Sequelize.STRING,
          defaultValue: 'default',
        },
        grant_type: {
          type: Sequelize.STRING,
          get: function() {
            return this.getDataValue('grant_type')
              ? this.getDataValue('grant_type').split(',')
              : [];
          },
          set: function(val) {
            this.setDataValue('grant_type', val.join(','));
          },
        },
        response_type: {
          type: Sequelize.STRING,
          get: function() {
            return this.getDataValue('response_type')
              ? this.getDataValue('response_type').split(',')
              : [];
          },
          set: function(val) {
            this.setDataValue('response_type', val.join(','));
          },
        },
        client_type: Sequelize.STRING(15),
        scope: Sequelize.STRING(80),
        extra: Sequelize.JSON,
      },
      {
        sync: { force: true },
      }
    );
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('oauth_client');
  },
};

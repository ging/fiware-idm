module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'oauth_client',
      {
        id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          unique: true,
          //defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        name: {
          type:
            Sequelize.STRING(255) +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: { notEmpty: { msg: 'name' } },
        },
        description: {
          type:
            Sequelize.TEXT() +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: { notEmpty: { msg: 'description' } },
        },
        secret: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        url: {
          type:
            Sequelize.STRING(2000) +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: { notEmpty: { msg: 'url' } },
        },
        redirect_uri: {
          type:
            Sequelize.STRING(2000) +
            (queryInterface.sequelize.dialect === 'mysql'
              ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci'
              : ''),
          validate: { notEmpty: { msg: 'redirectUri' } },
          get() {
            return this.getDataValue('redirect_uri')
              ? this.getDataValue('redirect_uri').split(',')
              : [];
          },
          set(val) {
            this.setDataValue('redirect_uri', val ? val.toString() : null);
          },
        },
        image: {
          type: Sequelize.STRING,
          defaultValue: 'default',
        },
        grant_type: {
          type: Sequelize.STRING,
          get() {
            return this.getDataValue('grant_type')
              ? this.getDataValue('grant_type').split(',')
              : [];
          },
          set(val) {
            this.setDataValue('grant_type', val.join(','));
          },
        },
        response_type: {
          type: Sequelize.STRING,
          get() {
            return this.getDataValue('response_type')
              ? this.getDataValue('response_type').split(',')
              : [];
          },
          set(val) {
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

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('oauth_client');
  },
};

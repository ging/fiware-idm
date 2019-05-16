module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addConstraint('oauth_access_token', ['refresh_token'], {
        type: 'foreign key',
        name: 'refresh_token',
        onDelete: 'CASCADE',
        references: {
          table: 'oauth_refresh_token',
          field: 'refresh_token',
        },
      })
      .then(() =>
        queryInterface.addColumn('oauth_access_token', 'authorization_code', {
          type: Sequelize.STRING,
        })
      )
      .then(() =>
        queryInterface.addColumn('oauth_refresh_token', 'authorization_code', {
          type: Sequelize.STRING,
        })
      )
      .then(() =>
        queryInterface.addColumn('oauth_refresh_token', 'valid', {
          type: Sequelize.BOOLEAN,
          defaultValue: null,
        })
      )
      .then(() =>
        queryInterface.addConstraint(
          'oauth_access_token',
          ['authorization_code'],
          {
            type: 'foreign key',
            name: 'authorization_code_at',
            onDelete: 'CASCADE',
            references: {
              table: 'oauth_authorization_code',
              field: 'authorization_code',
            },
          }
        )
      )
      .then(() =>
        queryInterface.addConstraint(
          'oauth_refresh_token',
          ['authorization_code'],
          {
            type: 'foreign key',
            name: 'authorization_code_rt',
            onDelete: 'CASCADE',
            references: {
              table: 'oauth_authorization_code',
              field: 'authorization_code',
            },
          }
        )
      )
      .then(() =>
        queryInterface.changeColumn('oauth_client', 'token_type', {
          type: Sequelize.STRING(2000),
          defaultValue: 'bearer',
          get() {
            return this.getDataValue('token_types')
              ? this.getDataValue('token_types').split(',')
              : [];
          },
          set(val) {
            this.setDataValue('token_types', val ? val.toString() : null);
          },
        })
      )
      .then(() =>
        queryInterface.renameColumn('oauth_client', 'token_type', 'token_types')
      );
  },

  down: (queryInterface, Sequelize) =>
    queryInterface
      .removeConstraint('oauth_access_token', 'refresh_token')
      .then(() =>
        queryInterface.removeColumn('oauth_access_token', 'authorization_code')
      )
      .then(() => queryInterface.removeColumn('oauth_refresh_token', 'valid'))
      .then(() =>
        queryInterface.changeColumn('oauth_client', 'token_types', {
          type: Sequelize.STRING,
          defaultValue: 'bearer',
        })
      )
      .then(() =>
        queryInterface.renameColumn('oauth_client', 'token_types', 'token_type')
      ),
};

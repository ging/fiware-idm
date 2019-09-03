module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .changeColumn('eidas_credentials', 'attributes_list', {
        type:
          Sequelize.JSON() +
          (queryInterface.sequelize.options.dialect === 'postgres'
            ? ' USING attributes_list::json'
            : ''),
      })
      .then(() =>
        queryInterface.changeColumn('user', 'extra', {
          type:
            Sequelize.JSON() +
            (queryInterface.sequelize.options.dialect === 'postgres'
              ? ' USING extra::json'
              : ''),
        })
      )
      .then(() =>
        queryInterface.changeColumn('user', 'scope', {
          type: Sequelize.STRING(2000),
          get() {
            return this.getDataValue('scope')
              ? this.getDataValue('scope').split(',')
              : [];
          },
          set(val) {
            this.setDataValue('scope', val ? val.toString() : null);
          },
        })
      )
      .then(() =>
        queryInterface.changeColumn('oauth_access_token', 'scope', {
          type: Sequelize.STRING(2000),
          get() {
            return this.getDataValue('scope')
              ? this.getDataValue('scope').split(',')
              : [];
          },
          set(val) {
            this.setDataValue('scope', val ? val.toString() : null);
          },
        })
      )
      .then(() =>
        queryInterface.changeColumn('oauth_authorization_code', 'scope', {
          type: Sequelize.STRING(2000),
          get() {
            return this.getDataValue('scope')
              ? this.getDataValue('scope').split(',')
              : [];
          },
          set(val) {
            this.setDataValue('scope', val ? val.toString() : null);
          },
        })
      )
      .then(() =>
        queryInterface.changeColumn('oauth_refresh_token', 'scope', {
          type: Sequelize.STRING(2000),
          get() {
            return this.getDataValue('scope')
              ? this.getDataValue('scope').split(',')
              : [];
          },
          set(val) {
            this.setDataValue('scope', val ? val.toString() : null);
          },
        })
      )
      .then(() =>
        queryInterface.changeColumn('oauth_client', 'scope', {
          type: Sequelize.STRING(2000),
          get() {
            return this.getDataValue('scope')
              ? this.getDataValue('scope').split(',')
              : [];
          },
          set(val) {
            this.setDataValue('scope', val ? val.toString() : null);
          },
        })
      ),
  down: (queryInterface, Sequelize) =>
    queryInterface
      .changeColumn('eidas_credentials', 'attributes_list', {
        type: Sequelize.TEXT(),
      })
      .then(() =>
        queryInterface.changeColumn('user', 'extra', {
          type: Sequelize.TEXT(),
        })
      )
      .then(() =>
        queryInterface.changeColumn('user', 'scope', {
          type: Sequelize.STRING(80),
        })
      )
      .then(() =>
        queryInterface.changeColumn('oauth_access_token', 'scope', {
          type: Sequelize.STRING(80),
        })
      )
      .then(() =>
        queryInterface.changeColumn('oauth_authorization_code', 'scope', {
          type: Sequelize.STRING(80),
        })
      )
      .then(() =>
        queryInterface.changeColumn('oauth_refresh_token', 'scope', {
          type: Sequelize.STRING(80),
        })
      )
      .then(() =>
        queryInterface.changeColumn('oauth_client', 'scope', {
          type: Sequelize.STRING(80),
        })
      ),
};

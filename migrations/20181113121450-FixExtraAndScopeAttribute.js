'use strict';

// console.log('in 20181113121450-FixExtraAndScopeAttribute.js');
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('eidas_credentials', 'attributes_list', {
        type: Sequelize.JSON() + ((queryInterface.sequelize.options.dialect == 'postgres') ? ' USING attributes_list::json' : '')
      }),
      queryInterface.changeColumn('user', 'extra', {
        type: Sequelize.JSON()  + ((queryInterface.sequelize.options.dialect == 'postgres') ? ' USING extra::json' : '')
      }),
      queryInterface.changeColumn('user', 'scope', {
        type: Sequelize.STRING(2000),
        get: function () {
          return (this.getDataValue('scope')) ? this.getDataValue('scope').split(',') : []
        },
        set: function (val) {
          this.setDataValue('scope', (val) ? val.toString() : null)
        }
      }),
      queryInterface.changeColumn('oauth_access_token', 'scope', {
        type: Sequelize.STRING(2000),
        get: function () {
          return (this.getDataValue('scope')) ? this.getDataValue('scope').split(',') : []
        },
        set: function (val) {
          this.setDataValue('scope', (val) ? val.toString() : null)
        }
      }),
      queryInterface.changeColumn('oauth_authorization_code', 'scope', {
        type: Sequelize.STRING(2000),
        get: function () {
          return (this.getDataValue('scope')) ? this.getDataValue('scope').split(',') : []
        },
        set: function (val) {
          this.setDataValue('scope', (val) ? val.toString() : null)
        }
      }),
      queryInterface.changeColumn('oauth_refresh_token', 'scope', {
        type: Sequelize.STRING(2000),
        get: function () {
          return (this.getDataValue('scope')) ? this.getDataValue('scope').split(',') : []
        },
        set: function (val) {
          this.setDataValue('scope', (val) ? val.toString() : null)
        }
      }),
      queryInterface.changeColumn('oauth_client', 'scope', {
        type: Sequelize.STRING(2000),
        get: function () {
          return (this.getDataValue('scope')) ? this.getDataValue('scope').split(',') : []
        },
        set: function (val) {
          this.setDataValue('scope', (val) ? val.toString() : null)
        }
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('eidas_credentials', 'attributes_list', {
        type: Sequelize.TEXT()
      }),
      queryInterface.changeColumn('user', 'extra', {
        type: Sequelize.TEXT()
      }),
      queryInterface.changeColumn('user', 'scope', {
        type: Sequelize.STRING(80)
      }),
      queryInterface.changeColumn('oauth_access_token', 'scope', {
        type: Sequelize.STRING(80)
      }),
      queryInterface.changeColumn('oauth_authorization_code', 'scope', {
        type: Sequelize.STRING(80)
      }),
      queryInterface.changeColumn('oauth_refresh_token', 'scope', {
        type: Sequelize.STRING(80)
      }),
      queryInterface.changeColumn('oauth_client', 'scope', {
        type: Sequelize.STRING(80)
      }),
    ])
  }
};

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('eidas_credentials', 'sp_type', {
        type: Sequelize.STRING(255),
        validate: { 
          notIn: {
            args: [['public', 'private']], 
            msg: "sp_type"
          } 
        },
        defaultValue: 'private'
      }),
      queryInterface.addColumn('eidas_credentials', 'attributes_list', {
        type: Sequelize.TEXT(),
        get: function () {
            return (this.getDataValue('attributes_list')) ? this.getDataValue('attributes_list').split(',') : []
        },
        set: function (val) {
           this.setDataValue('attributes_list',val.join(','))
        } 
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('eidas_credentials', 'sp_type'),
      queryInterface.removeColumn('eidas_credentials', 'attributes_list')
    ])
  }
};
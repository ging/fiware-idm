'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('pep_proxy',
            {
                id: {
                  type: Sequelize.STRING,
                  primaryKey: true
                }, password: {
                  type: Sequelize.STRING(40),
                  set: function (password) {
                      var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
                      // Evita passwords vacíos
                      if (password === '') {
                          encripted = '';
                      }
                      this.setDataValue('password', encripted);
                  }
                },
                oauth_client_id: {
                    type: Sequelize.UUID,
                    onDelete: 'CASCADE',
                    references: {
                        model: 'oauth_client',
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
        return queryInterface.dropTable('pep_proxy');
    }
};
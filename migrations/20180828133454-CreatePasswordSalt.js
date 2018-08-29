'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return [
      queryInterface.addColumn('user', 'salt', {
        type: Sequelize.STRING
      }),
      queryInterface.changeColumn('user', 'password', {
        type: Sequelize.STRING(40),
        validate: { notEmpty: {msg: "password1"}},
        set: function (password) {

            var salt = crypto.randomBytes(16).toString('hex').slice(0,16)

            var encripted = crypto.createHmac('sha1', salt).update(password).digest('hex');
            // Evita passwords vacíos
            if (password === '') {
                encripted = '';
            }
            this.setDataValue('password', encripted);
        }
      })
    ]

  },

  down: (queryInterface, Sequelize) => {

    return [
      queryInterface.removeColumn('user', 'salt'),
      queryInterface.changeColumn('user', 'password', {
        type: Sequelize.STRING(40),
        validate: { notEmpty: {msg: "password1"}},
        set: function (password) {

            var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
            // Evita passwords vacíos
            if (password === '') {
                encripted = '';
            }
            this.setDataValue('password', encripted);
        }
      })
    ]

  }
};

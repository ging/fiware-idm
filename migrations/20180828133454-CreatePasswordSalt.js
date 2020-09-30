module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('user', 'salt', {
        type: Sequelize.STRING
      }),
      queryInterface.changeColumn('user', 'password', {
        type: Sequelize.STRING(40),
        validate: { notEmpty: { msg: 'password1' } },
        set(password) {
          const salt = crypto.randomBytes(16).toString('hex').slice(0, 16);

          let encripted = crypto.createHmac('sha1', salt).update(password).digest('hex');
          // Evita passwords vacíos
          if (password === '') {
            encripted = '';
          }
          this.setDataValue('salt', salt);
          this.setDataValue('password', encripted);
        }
      }),
      queryInterface.addColumn('iot', 'salt', {
        type: Sequelize.STRING
      }),
      queryInterface.changeColumn('iot', 'password', {
        type: Sequelize.STRING(40),
        set(password) {
          const salt = crypto.randomBytes(16).toString('hex').slice(0, 16);

          let encripted = crypto.createHmac('sha1', salt).update(password).digest('hex');
          // Evita passwords vacíos
          if (password === '') {
            encripted = '';
          }
          this.setDataValue('salt', salt);
          this.setDataValue('password', encripted);
        }
      }),
      queryInterface.addColumn('pep_proxy', 'salt', {
        type: Sequelize.STRING
      }),
      queryInterface.changeColumn('pep_proxy', 'password', {
        type: Sequelize.STRING(40),
        set(password) {
          const salt = crypto.randomBytes(16).toString('hex').slice(0, 16);

          let encripted = crypto.createHmac('sha1', salt).update(password).digest('hex');
          // Evita passwords vacíos
          if (password === '') {
            encripted = '';
          }
          this.setDataValue('salt', salt);
          this.setDataValue('password', encripted);
        }
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('user', 'salt'),
      queryInterface.changeColumn('user', 'password', {
        type: Sequelize.STRING(40),
        validate: { notEmpty: { msg: 'password1' } },
        set(password) {
          let encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
          // Evita passwords vacíos
          if (password === '') {
            encripted = '';
          }
          this.setDataValue('password', encripted);
        }
      }),
      queryInterface.removeColumn('iot', 'salt'),
      queryInterface.changeColumn('iot', 'password', {
        type: Sequelize.STRING(40),
        set(password) {
          let encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
          // Evita passwords vacíos
          if (password === '') {
            encripted = '';
          }
          this.setDataValue('password', encripted);
        }
      }),
      queryInterface.removeColumn('pep_proxy', 'salt'),
      queryInterface.changeColumn('pep_proxy', 'password', {
        type: Sequelize.STRING(40),
        set(password) {
          let encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
          // Evita passwords vacíos
          if (password === '') {
            encripted = '';
          }
          this.setDataValue('password', encripted);
        }
      })
    ]);
  }
};

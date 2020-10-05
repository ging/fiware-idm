module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'user',
      {
        id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          primaryKey: true,
          unique: true
          //defaultValue: Sequelize.UUIDV4
        },
        username: {
          type:
            Sequelize.STRING(64) +
            (queryInterface.sequelize.dialect === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
          validate: { notEmpty: { msg: 'username' } }
        },
        description: {
          type:
            Sequelize.TEXT() +
            (queryInterface.sequelize.dialect === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
        },
        website: {
          type:
            Sequelize.STRING(2000) +
            (queryInterface.sequelize.dialect === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
        },
        image: {
          type: Sequelize.STRING,
          defaultValue: 'default'
        },
        gravatar: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        email: {
          type: Sequelize.STRING,
          unique: true,
          validate: {
            notEmpty: { msg: 'email' },
            isEmail: { msg: 'emailInvalid' },
            isUnique(value, next) {
              const self = this;
              User.find({ where: { email: value } })
                .then(function (user) {
                  if (user && self.id !== user.id) {
                    return next('emailUsed');
                  }
                  return next();
                })
                .catch(function (err) {
                  return next(err);
                });
            }
          }
        },
        password: {
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
        },
        date_password: {
          type: Sequelize.DATE
        },
        enabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        admin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        extra: {
          type: Sequelize.STRING,
          get() {
            return this.getDataValue('extra') ? JSON.parse(this.getDataValue('extra')) : {};
          },
          set(val) {
            this.setDataValue('extra', JSON.stringify(val));
          }
        },
        scope: {
          type: Sequelize.STRING(80)
        }
      },
      {
        sync: { force: true }
      }
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('user');
  }
};

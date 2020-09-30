// Table to store pep proxy information

const config_service = require('../lib/configService.js');
const config = config_service.get_config().password_encryption;

// Vars for encrypting
const crypto = require('crypto');
const key = config.key;

module.exports = function (sequelize, DataTypes) {
  const PepProxy = sequelize.define(
    'PepProxy',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      password: {
        type: DataTypes.STRING(40),
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
      },
      salt: {
        type: DataTypes.STRING
      }
    },
    {
      tableName: 'pep_proxy',
      timestamps: false,
      underscored: true
    }
  );

  PepProxy.prototype.verifyPassword = function (password) {
    const encripted = crypto
      .createHmac('sha1', this.salt ? this.salt : key)
      .update(password)
      .digest('hex');
    return encripted === this.password;
  };

  return PepProxy;
};

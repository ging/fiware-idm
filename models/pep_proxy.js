// Table to store pep proxy information

var config = require('../config.js').password_encryption

// Vars for encrypting
var crypto = require('crypto');
var key = config.key;

module.exports = function(sequelize, DataTypes) {
  var PepProxy = sequelize.define('PepProxy', 
    { id: {
      type: DataTypes.STRING,
      primaryKey: true
    }, password: {
      type: DataTypes.STRING(40),
      set: function (password) {

          var salt = crypto.randomBytes(16).toString('hex').slice(0,16)

          var encripted = crypto.createHmac('sha1', salt).update(password).digest('hex');
          // Evita passwords vacíos
          if (password === '') {
              encripted = '';
          }
          this.setDataValue('salt', salt);
          this.setDataValue('password', encripted);
      }
    }
  }, {
      tableName: 'pep_proxy',
      timestamps: false,
      underscored: true
  });

  PepProxy.prototype.verifyPassword = function(salt, password) {
    var encripted = crypto.createHmac('sha1', (salt) ? salt : key).update(password).digest('hex');
    return encripted === this.password;
  }

  return PepProxy;
};
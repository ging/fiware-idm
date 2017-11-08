// Table to store pep proxy information

var config = require('../config.js').password_encryption

// Vars for encrypting
var crypto = require('crypto');
var key = config.key;

module.exports = function(sequelize, DataTypes) {
  var PepProxy = sequelize.define('PepProxy', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    }, password: {
      type: DataTypes.STRING,
      set: function (password) {
          var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
          // Evita passwords vacíos
          if (password === '') {
              encripted = '';
          }
          this.setDataValue('password', encripted);
      }
    }
  }, {
      tableName: 'pep_proxy',
      timestamps: false,
      underscored: true
  });

  PepProxy.prototype.verifyPassword = function(password) {
    var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
    return encripted === this.password;
  }

  return PepProxy;
};
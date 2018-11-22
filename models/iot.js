// Table to store sensor information

var config = require('../config.js').password_encryption

// Vars for encrypting
var crypto = require('crypto');
var key = config.key;

module.exports = function(sequelize, DataTypes) {
  var Iot = sequelize.define('Iot', 
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
    }, salt: {
      type: DataTypes.STRING
    }
  }, {
      tableName: 'iot',
      timestamps: false,
      underscored: true
  });

  Iot.prototype.verifyPassword = function(password) {
    var encripted = crypto.createHmac('sha1', (this.salt) ? this.salt : key).update(password).digest('hex');
    return encripted === this.password;
  }

  return Iot;
};

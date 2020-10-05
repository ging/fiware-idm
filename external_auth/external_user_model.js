// User model
const config_service = require('../lib/configService.js');
const config = config_service.get_config();
const external_auth = config.external_auth;

// Vars for encrypting
const crypto = require('crypto');
const key = external_auth.password_encryption_key;
const bcrypt = require('bcrypt');

/* eslint-disable snakecase/snakecase */

module.exports = function (sequelize, DataTypes) {
  const User_Ext = sequelize.define(
    'User_Ext',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      username: {
        type:
          DataTypes.STRING(64) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: { notEmpty: { msg: 'username' } }
      },
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      password_salt: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING(40),
        validate: { notEmpty: { msg: 'password1' } }
      }
    },
    {
      tableName: external_auth.database.user_table,
      timestamps: false,
      underscored: true
    }
  );

  User_Ext.prototype.verifyPassword = function (password) {
    let valid_pass;

    switch (external_auth.password_encryption) {
      case 'sha1': {
        const encripted = crypto
          .createHmac('sha1', this.password_salt ? this.password_salt : key)
          .update(password)
          .digest('hex');
        valid_pass = encripted === this.password;
        break;
      }
      case 'bcrypt': {
        valid_pass = bcrypt.compareSync(password, this.password);
        break;
      }
      case 'pbkdf2': {
        const encripted = crypto
          .pbkdf2Sync(
            password,
            this.password_salt,
            external_auth.password_encryption_opt.iterations,
            external_auth.password_encryption_opt.keylen,
            external_auth.password_encryption_opt.digest
          )
          .toString('base64');
        valid_pass = encripted === this.password;
        break;
      }

      default: {
        valid_pass = false;
      }
    }
    return valid_pass;
  };

  return User_Ext;
};

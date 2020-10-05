const config_service = require('../../lib/configService.js');
const config_oauth2 = config_service.get_config().oauth2;

// BD to store all applicationes with their feautures
module.exports = function (sequelize, DataTypes) {
  const OAuthClient = sequelize.define(
    'OauthClient',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type:
          DataTypes.STRING(255) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: { notEmpty: { msg: 'name' } }
      },
      description: {
        type:
          DataTypes.TEXT() + (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: { notEmpty: { msg: 'description' } }
      },
      secret: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      url: {
        type:
          DataTypes.STRING(2000) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: {
          notEmpty: { msg: 'url' },
          isUnique(value, next) {
            if (config_oauth2.unique_url) {
              const self = this;
              OAuthClient.find({ where: { url: value } })
                .then(function (oauth_client) {
                  if (oauth_client && self.id !== oauth_client.id) {
                    return next('urlUsed');
                  }
                  return next();
                })
                .catch(function (err) {
                  return next(err);
                });
            } else {
              return next();
            }
          }
        }
      },
      redirect_uri: {
        type:
          DataTypes.STRING(2000) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : ''),
        validate: { notEmpty: { msg: 'redirectUri' } },
        get() {
          return this.getDataValue('redirect_uri') ? this.getDataValue('redirect_uri').split(',') : [];
        },
        set(val) {
          this.setDataValue('redirect_uri', val ? val.toString() : null);
        }
      },
      redirect_sign_out_uri: {
        type:
          DataTypes.STRING(2000) +
          (sequelize.getDialect() === 'mysql' ? ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci' : '')
      },
      image: {
        type: DataTypes.STRING,
        defaultValue: 'default'
      },
      grant_type: {
        type: DataTypes.STRING,
        get() {
          return this.getDataValue('grant_type') ? this.getDataValue('grant_type').split(',') : [];
        },
        set(val) {
          this.setDataValue('grant_type', val.join(','));
        }
      },
      response_type: {
        type: DataTypes.STRING,
        get() {
          return this.getDataValue('response_type') ? this.getDataValue('response_type').split(',') : [];
        },
        set(val) {
          this.setDataValue('response_type', val.join(','));
        }
      },
      token_types: {
        type: DataTypes.STRING(2000),
        defaultValue: 'bearer',
        get() {
          return this.getDataValue('token_types') ? this.getDataValue('token_types').split(',') : ['bearer'];
        },
        set(val) {
          if (val && val.length > 0) {
            val.push('bearer');
          } else {
            val = ['bearer'];
          }
          this.setDataValue('token_types', val.toString());
        }
      },
      jwt_secret: {
        type: DataTypes.STRING(2000),
        defaultValue: null
      },
      client_type: DataTypes.STRING(15),
      scope: {
        type: DataTypes.STRING(2000),
        get() {
          return this.getDataValue('scope') ? this.getDataValue('scope').split(',') : [];
        },
        set(val) {
          this.setDataValue('scope', val ? val.toString() : null);
        }
      },
      extra: DataTypes.JSON
    },
    {
      tableName: 'oauth_client',
      timestamps: false,
      underscored: true
    }
  );

  return OAuthClient;
};

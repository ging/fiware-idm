// BD to store all OAuth Access Tokens

module.exports = function (sequelize, DataTypes) {
  const OAuthAccessToken = sequelize.define(
    'OauthAccessToken',
    {
      access_token: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      expires: DataTypes.DATE,
      scope: {
        type: DataTypes.STRING(2000),
        get() {
          return this.getDataValue('scope') ? this.getDataValue('scope').split(',') : [];
        },
        set(val) {
          this.setDataValue('scope', val ? val.toString() : null);
        }
      },
      valid: DataTypes.BOOLEAN,
      extra: DataTypes.JSON
    },
    {
      tableName: 'oauth_access_token',
      timestamps: false,
      underscored: true
    }
  );

  return OAuthAccessToken;
};

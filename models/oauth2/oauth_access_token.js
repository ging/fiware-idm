// BD to store all OAuth Access Tokens

module.exports = function(sequelize, DataTypes) {
  var OAuthAccessToken = sequelize.define('OauthAccessToken', {
    access_token: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    expires: DataTypes.DATE,
    scope: DataTypes.STRING,
    refresh_token: DataTypes.STRING,
    valid: DataTypes.BOOLEAN,
    extra: DataTypes.JSON
  }, {
    tableName: 'oauth_access_token',
    timestamps: false,
    underscored: true

  });

  return OAuthAccessToken;
};

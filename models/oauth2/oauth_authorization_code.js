// BD to store all authorizations codes

module.exports = function (sequelize, DataTypes) {
  var OAuthAuthorizationCode = sequelize.define('OauthAuthorizationCode', {
    authorization_code: {
      type: DataTypes.STRING(256),
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    expires: DataTypes.DATE,
    redirect_uri: DataTypes.STRING(2000),
    scope: DataTypes.STRING,
    valid: DataTypes.BOOLEAN,
    extra: DataTypes.JSON,
    ext_user_id: DataTypes.STRING
  }, {
    tableName: 'oauth_authorization_code',
    timestamps: false,
    underscored: true
  });

  return OAuthAuthorizationCode;
};

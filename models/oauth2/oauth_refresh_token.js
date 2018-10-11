// BD to store all OAuth Refresh Tokens

module.exports = function (sequelize, DataTypes) {
  var RefreshToken = sequelize.define('RefreshToken', {
    refresh_token: {
      type: DataTypes.STRING(256),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    expires: DataTypes.DATE,
    scope: DataTypes.STRING,
    ext_user_id: DataTypes.STRING
  }, {
    tableName: 'oauth_refresh_token',
    timestamps: false,
    underscored: true,
  });

  return RefreshToken;
};

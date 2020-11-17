// BD to store OAuth scopes

module.exports = function (sequelize, DataTypes) {
  const OAuthScope = sequelize.define(
    'OauthScope',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      scope: DataTypes.STRING,
      is_default: DataTypes.BOOLEAN
    },
    {
      tableName: 'oauth_scope',
      timestamps: false,
      underscored: true
    }
  );

  return OAuthScope;
};

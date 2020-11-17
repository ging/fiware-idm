// BD to store all OAuth Refresh Tokens

module.exports = function (sequelize, DataTypes) {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      refresh_token: {
        type: DataTypes.STRING(256),
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
      valid: {
        type: DataTypes.BOOLEAN,
        defaultValue: null
      }
    },
    {
      tableName: 'oauth_refresh_token',
      timestamps: false,
      underscored: true
    }
  );

  return RefreshToken;
};

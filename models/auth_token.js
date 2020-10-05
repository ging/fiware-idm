// BD to store all Auth Tokens

module.exports = function (sequelize, DataTypes) {
  const AuthToken = sequelize.define(
    'AuthToken',
    {
      access_token: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      expires: DataTypes.DATE,
      valid: DataTypes.BOOLEAN
    },
    {
      tableName: 'auth_token',
      timestamps: false,
      underscored: true
    }
  );

  return AuthToken;
};

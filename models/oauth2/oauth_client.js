// BD to store all applicationes with their feautures

module.exports = function(sequelize, DataTypes) {
  var OAuthClient = sequelize.define('OauthClient', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }, name: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "name"}}
    }, description: {
      type: DataTypes.TEXT()  + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "description"}}
    }, secret: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    }, url: {
      type: DataTypes.STRING(2000)  + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "url"}}
    }, redirect_uri: {
      type: DataTypes.STRING(2000)  + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "redirectUri"}}
    }, image: {
      type: DataTypes.STRING,
      defaultValue: 'default'
    },
    client_type: DataTypes.STRING(15), 
    grant_type: DataTypes.STRING(25), 
    response_type: DataTypes.STRING(5),
    scope: DataTypes.STRING(80),
    extra: DataTypes.JSON 
  }, {
      tableName: 'oauth_client',
      timestamps: false,
      underscored: true
  });

  return OAuthClient;
};

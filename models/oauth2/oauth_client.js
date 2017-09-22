// BD to store all applicationes with their feautures

module.exports = function(sequelize, DataTypes) {
  var OAuthClient = sequelize.define('OauthClient', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }, name: {
      type: DataTypes.STRING(255),
      validate: { notEmpty: {msg: "name"}}
    }, description: {
      type: DataTypes.TEXT,
      validate: { notEmpty: {msg: "description"}}
    }, secret: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    }, url: {
      type: DataTypes.STRING(2000),
      validate: { notEmpty: {msg: "url"}}
    }, redirect_uri: {
      type: DataTypes.STRING(2000),
      validate: { notEmpty: {msg: "redirectUri"}}
    }, 
    client_type: DataTypes.STRING, 
    grant_type: DataTypes.STRING(80), 
    response_type: DataTypes.STRING(80), 
    scope: DataTypes.STRING(80),
    extra: DataTypes.JSON 
  }, {
      tableName: 'oauth_client',
      timestamps: false,
      underscored: true
  });

  return OAuthClient;
};

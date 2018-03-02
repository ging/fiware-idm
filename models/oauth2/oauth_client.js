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
    }, grant_type: {
      type: DataTypes.STRING,
      get: function () {
          return (this.getDataValue('grant_type')) ? this.getDataValue('grant_type').split(',') : []
      },
      set: function (val) {
         this.setDataValue('grant_type',val.join(','))
      } 
    }, response_type:  {     
      type: DataTypes.STRING,
      get: function () {
          return (this.getDataValue('response_type')) ? this.getDataValue('response_type').split(',') : []
      },
      set: function (val) {
         this.setDataValue('response_type',val.join(','))
      } 
    },
    client_type: DataTypes.STRING(15), 
    scope: DataTypes.STRING(80),
    extra: DataTypes.JSON 
  }, {
      tableName: 'oauth_client',
      timestamps: false,
      underscored: true
  });

  return OAuthClient;
};

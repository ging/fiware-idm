// BD to store all Auth Tokens

module.exports = function (sequelize, DataTypes) {
  const DelegationEvidence = sequelize.define(
    'DelegationEvidence',
    {
      policy_issuer: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      access_subject: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      policy: {
        type: DataTypes.JSON,
        allowNull: false
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: [ 'policy_issuer', 'access_subject' ]
        }
      ],
      tableName: 'delegation_evidence',
      timestamps: false,
      underscored: true
    }
  );

  return DelegationEvidence;
};


'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'delegation_evidence',
      {
        policy_issuer: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true
        },
        access_subject: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true
        },
        policy: {
          type: Sequelize.JSON,
          allowNull: false
        }
      },
      {
        uniqueKeys: {
          policy_issuer_access_subject_unique: {
            customIndex: true,
            fields: ['policy_issuer', 'access_subject'],
          }
        },
        sync: { force: true }
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('delegation_evidence');
  }
};

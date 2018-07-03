'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('eidas_credentials',
            {
                id: {
                  type: Sequelize.UUID,
                  defaultValue: Sequelize.UUIDV4,
                  primaryKey: true
                }, support_contact_person_name: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "support_contact_person_name"}}
                }, support_contact_person_surname: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "support_contact_person_surname"}}
                }, support_contact_person_email: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "support_contact_person_email"}}
                }, support_contact_person_telephone_number: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "support_contact_person_telephone_number"}}
                }, support_contact_person_company: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "support_contact_person_company"}}
                }, technical_contact_person_name: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "technical_contact_person_name"}}
                }, technical_contact_person_surname: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "technical_contact_person_surname"}}
                }, technical_contact_person_email: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "technical_contact_person_email"}}
                }, technical_contact_person_telephone_number: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "technical_contact_person_telephone_number"}}
                }, technical_contact_person_company: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "technical_contact_person_company"}}
                },organization_name: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "organization_name"}}
                }, organization_url: {
                  type: Sequelize.STRING(255), // + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "organization_url"}}
                }, oauth_client_id: {
                    type: Sequelize.UUID,
                    onDelete: 'CASCADE',
                    unique: true,
                    references: {
                        model: 'oauth_client',
                        key: 'id'
                    }
                }
            },
            {
                sync: {force: true}
            }
        );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('eidas_credentials');
  }
};

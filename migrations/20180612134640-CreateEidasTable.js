'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('eidas_credentials',
            {
                id: {
                  type: Sequelize.UUID,
                  defaultValue: Sequelize.UUIDV4,
                  primaryKey: true
                }, contact_person_name: {
                  type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "contact_person_name"}}
                }, contact_person_surname: {
                  type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "contact_person_surname"}}
                }, contact_person_email: {
                  type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "contact_person_email"}}
                }, contact_person_telephone_number: {
                  type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "contact_person_telephone_number"}}
                }, contact_person_company: {
                  type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "contact_person_company"}}
                }, organization_name: {
                  type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "organization_name"}}
                }, organization_url: {
                  type: Sequelize.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                  validate: { notEmpty: {msg: "organization_url"}}
                }, oauth_client_id: {
                    type: Sequelize.UUID,
                    onDelete: 'CASCADE',
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

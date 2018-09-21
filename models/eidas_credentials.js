// BD to store all eidas credentials of an application

module.exports = function(sequelize, DataTypes) {
  var EidasCredentials = sequelize.define('EidasCredentials', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }, support_contact_person_name: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "support_contact_person_name"}}
    }, support_contact_person_surname: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "support_contact_person_surname"}}
    }, support_contact_person_email: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "support_contact_person_email"}}
    }, support_contact_person_telephone_number: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "support_contact_person_telephone_number"}}
    }, support_contact_person_company: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "support_contact_person_company"}}
    }, technical_contact_person_name: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "technical_contact_person_name"}}
    }, technical_contact_person_surname: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "technical_contact_person_surname"}}
    }, technical_contact_person_email: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "technical_contact_person_email"}}
    }, technical_contact_person_telephone_number: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "technical_contact_person_telephone_number"}}
    }, technical_contact_person_company: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "technical_contact_person_company"}}
    }, organization_name: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "organization_name"}}
    }, organization_url: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "organization_url"}}
    }, organization_nif: {
      type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      validate: { notEmpty: {msg: "organization_nif"}}
    }
  }, {
      tableName: 'eidas_credentials',
      timestamps: false,
      underscored: true
  });

  return EidasCredentials;
};

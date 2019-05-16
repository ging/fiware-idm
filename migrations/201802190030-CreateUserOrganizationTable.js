module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'user_organization',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        role: {
          type: Sequelize.STRING(10),
        },
        user_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'user',
            key: 'id',
          },
        },
        organization_id: {
          type: Sequelize.STRING(36), //Sequelize.UUID,
          onDelete: 'CASCADE',
          references: {
            model: 'organization',
            key: 'id',
          },
        },
      },
      {
        sync: { force: true },
      }
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('user_organization');
  },
};

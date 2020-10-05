// Model that define relation between roles, users and permissions

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Ptp',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      previous_job_id: {
        type: DataTypes.STRING,
        primaryKey: true
      }
    },
    {
      tableName: 'ptp',
      timestamps: false,
      underscored: true
    }
  );
};

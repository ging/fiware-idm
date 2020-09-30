// Model that define relation between users that has authorized applciation to see theirs data

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'User_Authorized_Application',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      shared_attributes: {
        type: DataTypes.STRING,
        get() {
          return this.getDataValue('shared_attributes') ? this.getDataValue('shared_attributes').split(',') : [];
        },
        set(val) {
          this.setDataValue('shared_attributes', val.join(','));
        }
      },
      login_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'user_authorized_application',
      timestamps: false,
      underscored: true
    }
  );
};

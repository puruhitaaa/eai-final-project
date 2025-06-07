const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const ReportEntry = sequelize.define("ReportEntry", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    word: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    severity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  })

  return ReportEntry
}

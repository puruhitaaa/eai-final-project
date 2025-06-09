const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Report = sequelize.define(
    "Report",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      insights: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      riskAssessment: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Unknown",
      },
      totalFlagged: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      categoryBreakdown: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      aiGenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Report",
      freezeTableName: true,
    }
  )

  return Report
}

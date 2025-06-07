const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const SentimentAnalysis = sequelize.define(
    "SentimentAnalysis",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sentiment: {
        type: DataTypes.STRING, // positive, negative, neutral
        allowNull: true,
      },
      appropriatenessScore: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0.0,
          max: 100.0,
        },
        defaultValue: 50.0,
      },
      toxicityScore: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0.0,
          max: 100.0,
        },
        defaultValue: 0.0,
      },
      professionalismScore: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0.0,
          max: 100.0,
        },
        defaultValue: 50.0,
      },
      aiGenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      analysisDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      review: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      // Define table name explicitly to prevent pluralization
      tableName: "SentimentAnalysis",
      // Force table name to match the model name exactly without pluralization
      freezeTableName: true,
    }
  )

  return SentimentAnalysis
}

const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const WordCategory = sequelize.define("WordCategory", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    word: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    confidence: {
      type: DataTypes.FLOAT,
      defaultValue: 100.0,
      validate: {
        min: 0.0,
        max: 100.0,
      },
    },
    aiGenerated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // Explicitly define the foreign key
    categoryId: {
      type: DataTypes.INTEGER,
      field: "categoryId",
      allowNull: true,
    },
  })
  return WordCategory
}

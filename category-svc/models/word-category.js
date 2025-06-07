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
      defaultValue: 1.0,
      validate: {
        min: 0.0,
        max: 1.0,
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
  })

  // Seed some initial data
  WordCategory.sync().then(async () => {
    const count = await WordCategory.count()
    if (count === 0) {
      // This would be populated with actual word-category mappings
      // For demo purposes, we'll use the example words from the WordCheck service
      await WordCategory.bulkCreate([
        { word: "example1", CategoryId: 4, confidence: 0.9 }, // mild
        { word: "example2", CategoryId: 2, confidence: 0.95 }, // sexual
        { word: "example3", CategoryId: 3, confidence: 0.8 }, // abusive
      ])
      console.log("Seeded initial word-category data")
    }
  })

  return WordCategory
}

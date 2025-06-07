const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const ProfaneWord = sequelize.define("ProfaneWord", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    word: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    severity: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1-5 scale, 5 being most severe
      validate: {
        min: 1,
        max: 5,
      },
    },
    contextDependent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    aiDetectable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  })

  // Seed some initial data
  ProfaneWord.sync().then(async () => {
    const count = await ProfaneWord.count()
    if (count === 0) {
      await ProfaneWord.bulkCreate([
        { word: "example1", severity: 2, contextDependent: true },
        { word: "example2", severity: 4, contextDependent: false },
        { word: "example3", severity: 3, contextDependent: true },
        // In a real app, you'd include actual profane words
      ])
      console.log("Seeded initial profane words data")
    }
  })

  return ProfaneWord
}

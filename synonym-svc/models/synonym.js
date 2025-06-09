const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Synonym = sequelize.define("Synonym", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    word: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    synonyms: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const value = this.getDataValue("synonyms")
        return value || []
      },
    },
    appropriatenessScore: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
      validate: {
        min: 0,
        max: 100,
      },
      comment: "0 is least appropriate, 100 is most appropriate",
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  })

  // Seed some initial data
  Synonym.sync().then(async () => {
    const count = await Synonym.count()
    if (count === 0) {
      await Synonym.bulkCreate([
        {
          word: "example1",
          synonyms: ["alternative1", "substitute1", "replacement1"],
          appropriatenessScore: 80,
        },
        {
          word: "example2",
          synonyms: ["alternative2", "substitute2", "replacement2"],
          appropriatenessScore: 90,
        },
        {
          word: "example3",
          synonyms: ["alternative3", "substitute3", "replacement3"],
          appropriatenessScore: 70,
        },
      ])
      console.log("Seeded initial synonym data")
    }
  })

  return Synonym
}

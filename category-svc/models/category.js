const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Category = sequelize.define("Category", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    severityLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 5,
      },
    },
  })

  // Seed some initial data
  Category.sync().then(async () => {
    const count = await Category.count()
    if (count === 0) {
      await Category.bulkCreate([
        {
          name: "racial",
          description: "Content that discriminates based on race or ethnicity",
          severityLevel: 5,
        },
        {
          name: "sexual",
          description: "Sexually explicit or inappropriate content",
          severityLevel: 4,
        },
        {
          name: "abusive",
          description: "Content that is abusive, threatening or harassing",
          severityLevel: 4,
        },
        {
          name: "mild",
          description: "Mildly inappropriate language",
          severityLevel: 1,
        },
      ])
      console.log("Seeded initial category data")
    }
  })

  return Category
}

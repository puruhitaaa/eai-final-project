const { Sequelize } = require("sequelize")
require("dotenv").config()

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "pass",
  database: process.env.DB_NAME || "category",
  logging: false,
})

// Define models
const Category = require("./category")(sequelize)
const WordCategory = require("./word-category")(sequelize)

// Define relationships with explicit foreign key
Category.hasMany(WordCategory, {
  foreignKey: "categoryId",
})
WordCategory.belongsTo(Category, {
  foreignKey: "categoryId",
})

// Maximum number of connection attempts
const MAX_RETRIES = 10
const RETRY_DELAY = 5000

// Test database connection and seed data with retry logic
const testConnection = async (retries = 0) => {
  try {
    console.log(
      `Attempting to connect to database (attempt ${
        retries + 1
      }/${MAX_RETRIES})...`
    )
    await sequelize.authenticate()
    console.log("Database connection established successfully.")

    try {
      // Always sync models to ensure tables exist with correct structure
      await sequelize.sync({ force: false })
      console.log("Models synchronized with database.")

      // Seed data after models are synchronized
      await seedData()
      return true
    } catch (syncErr) {
      console.error("Error syncing models:", syncErr.message)
      return false
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error)

    if (retries < MAX_RETRIES - 1) {
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return testConnection(retries + 1)
    } else {
      console.error(`Failed to connect after ${MAX_RETRIES} attempts.`)
      return false
    }
  }
}

// Seed initial data
const seedData = async () => {
  try {
    // First check if categories exist
    const categoryCount = await Category.count()
    if (categoryCount === 0) {
      console.log("No categories found, seeding initial category data")
      // Create initial categories
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
    } else {
      console.log(`Found ${categoryCount} existing categories, skipping seed`)
    }

    // Then check and seed word categories
    const wordCategoryCount = await WordCategory.count()
    if (wordCategoryCount === 0) {
      // Get all categories to ensure they exist
      const categories = await Category.findAll()

      if (categories.length > 0) {
        // Convert to a lookup map for easier reference
        const categoryMap = {}
        categories.forEach((category) => {
          categoryMap[category.name] = category.id
        })

        // Create word categories with proper foreign keys
        try {
          await WordCategory.bulkCreate([
            {
              word: "example1",
              categoryId: categoryMap["mild"] || categories[3]?.id || 1,
              confidence: 90,
            },
            {
              word: "example2",
              categoryId: categoryMap["sexual"] || categories[1]?.id || 2,
              confidence: 95,
            },
            {
              word: "example3",
              categoryId: categoryMap["abusive"] || categories[2]?.id || 3,
              confidence: 80,
            },
          ])
          console.log("Seeded initial word-category data")
        } catch (err) {
          console.log(
            "Error creating word categories, they may already exist:",
            err.message
          )
        }
      } else {
        console.log("No categories found, cannot seed word categories")
      }
    } else {
      console.log(
        `Found ${wordCategoryCount} existing word categories, skipping seed`
      )
    }
  } catch (error) {
    console.error("Error seeding data:", error)
  }
}

// Start the connection and initialization process
testConnection()

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Category,
  WordCategory,
}

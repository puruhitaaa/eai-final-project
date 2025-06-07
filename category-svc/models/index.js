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

// Define relationships
Category.hasMany(WordCategory)
WordCategory.belongsTo(Category)

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully.")
    // Sync all defined models to the database
    await sequelize.sync({ alter: true })
    console.log("Models synchronized with database.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}

testConnection()

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Category,
  WordCategory,
}

const { Sequelize } = require("sequelize")
require("dotenv").config()

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "pass",
  database: process.env.DB_NAME || "sentiment",
  logging: false,
})

// Define models
const SentimentAnalysis = require("./sentiment-analysis")(sequelize)

// Maximum number of connection attempts
const MAX_RETRIES = 10
const RETRY_DELAY = 5000

// Test database connection with retry logic
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
      // Try to force create tables on first run
      console.log("Creating database tables if they don't exist...")
      // Use force: true to recreate tables
      await sequelize.sync({ force: true })
      console.log("Database tables created successfully.")
    } catch (syncErr) {
      console.error("Error creating tables:", syncErr.message)

      // If forcing fails, try with alter: true
      try {
        await sequelize.sync({ alter: true })
        console.log("Tables synchronized with existing database.")
      } catch (alterErr) {
        console.error("Error synchronizing tables:", alterErr.message)
      }
    }

    return true
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

// Start the connection process
testConnection()

// Export models and Sequelize instance
module.exports = {
  sequelize,
  SentimentAnalysis,
}

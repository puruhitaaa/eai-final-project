const { Sequelize } = require("sequelize")
require("dotenv").config()

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "pass",
  database: process.env.DB_NAME || "synonym",
  logging: false,
})

// Define models
const Synonym = require("./synonym")(sequelize)

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

    // First try to query existing tables to see if they exist
    try {
      await sequelize.getQueryInterface().showAllTables()
      console.log("Tables exist, updating sync with alter:true")
      // Use alter:true to update table structure if needed
      await sequelize.sync({ alter: true })
      console.log("Models synchronized with database (alter:true).")
    } catch (err) {
      // If tables don't exist or can't be queried, try syncing
      try {
        // Sync all defined models to the database
        await sequelize.sync({ force: false })
        console.log("Models synchronized with database (force:false).")
      } catch (syncErr) {
        // If sync fails due to tables already existing, just continue
        console.log(
          "Could not sync models, likely because they already exist:",
          syncErr.message
        )
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
  Synonym,
}

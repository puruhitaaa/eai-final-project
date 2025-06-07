const { Sequelize } = require("sequelize")
require("dotenv").config()

// Database connection parameters
const dbHost = process.env.DB_HOST || "localhost"
const dbUser = process.env.DB_USER || "user"
const dbPassword = process.env.DB_PASSWORD || "pass"
const dbName = process.env.DB_NAME || "database"

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: "postgres",
  host: dbHost,
  username: dbUser,
  password: dbPassword,
  database: dbName,
  logging: false,
})

// Maximum number of connection attempts
const MAX_RETRIES = 10

// Delay between connection attempts in ms
const RETRY_DELAY = 5000

// Wait for the database to be available
const waitForDatabase = async (retries = 0) => {
  try {
    console.log(
      `Attempting to connect to database (attempt ${
        retries + 1
      }/${MAX_RETRIES})...`
    )
    await sequelize.authenticate()
    console.log("Database connection has been established successfully.")
    return true
  } catch (error) {
    console.error("Unable to connect to the database:", error.message)

    if (retries < MAX_RETRIES - 1) {
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return waitForDatabase(retries + 1)
    } else {
      console.error(`Failed to connect after ${MAX_RETRIES} attempts.`)
      return false
    }
  }
}

// Run if this script is executed directly
if (require.main === module) {
  waitForDatabase()
    .then((success) => {
      if (success) {
        console.log("Database is ready.")
        process.exit(0)
      } else {
        console.error("Database connection failed.")
        process.exit(1)
      }
    })
    .catch((err) => {
      console.error("An unexpected error occurred:", err)
      process.exit(1)
    })
}

module.exports = waitForDatabase

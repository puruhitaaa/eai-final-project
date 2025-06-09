const { Sequelize } = require("sequelize")
require("dotenv").config()

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "pass",
  database: process.env.DB_NAME || "report",
  logging: false,
})

// Define models
const Report = require("./report")(sequelize)
const ReportEntry = require("./report-entry")(sequelize)

// Define relationships with explicit foreign keys
Report.hasMany(ReportEntry, {
  foreignKey: {
    name: "reportId",
    field: "reportId",
  },
})

ReportEntry.belongsTo(Report, {
  foreignKey: {
    name: "reportId",
    field: "reportId",
  },
})

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
      // Always sync models to ensure tables exist with correct structure
      await sequelize.sync({ force: false, alter: true })
      console.log("Models synchronized with database.")
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

// Start the connection process
testConnection()

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Report,
  ReportEntry,
}

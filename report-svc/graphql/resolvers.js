const reportService = require("../services/report-service")
const { GraphQLScalarType } = require("graphql")

// Custom scalar for JSON
const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "JSON scalar type",
  serialize(value) {
    return value
  },
  parseValue(value) {
    return value
  },
  parseLiteral(ast) {
    return ast.value
  },
})

const resolvers = {
  JSON: JSONScalar,

  Query: {
    getReports: async (_, { limit, offset }) => {
      return await reportService.getReports(limit, offset)
    },
    getReportById: async (_, { id }) => {
      return await reportService.getReportById(id)
    },
    getReportEntries: async (
      _,
      { reportId, startDate, endDate, limit, offset }
    ) => {
      return await reportService.getReportEntries(
        reportId,
        startDate,
        endDate,
        limit,
        offset
      )
    },
  },

  Mutation: {
    logReport: async (_, { word, category, context, severity }) => {
      return await reportService.logReport(word, category, context, severity)
    },
    generateReport: async (_, { startDate, endDate, title }) => {
      return await reportService.generateReport(startDate, endDate, title)
    },
  },

  Report: {
    categories(report) {
      // Transform the categoryBreakdown JSON into an array of CategoryCount objects
      if (report.categoryBreakdown) {
        return Object.entries(report.categoryBreakdown).map(
          ([name, count]) => ({
            name,
            count,
          })
        )
      }
      return []
    },

    async entries(report, { limit = 100, offset = 0 }) {
      if (report.entries) {
        // If entries are already loaded (from generateReport)
        return report.entries.slice(offset, offset + limit)
      }

      // Otherwise fetch them
      return await reportService.getReportEntries(
        report.id,
        null,
        null,
        limit,
        offset
      )
    },
  },
}

module.exports = resolvers

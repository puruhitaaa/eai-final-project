const { gql } = require("apollo-server")

const typeDefs = gql`
  type ReportEntry {
    id: ID!
    word: String!
    category: String
    context: String
    timestamp: String!
    severity: Int
  }

  type CategoryCount {
    name: String!
    count: Int!
  }

  type Report {
    id: ID!
    title: String!
    startDate: String!
    endDate: String!
    summary: String
    totalFlagged: Int!
    categoryBreakdown: JSON
    categories: [CategoryCount]
    insights: [String]
    riskAssessment: String
    aiGenerated: Boolean
    createdAt: String!
    entries(limit: Int, offset: Int): [ReportEntry]
  }

  scalar JSON

  type Query {
    getReports(limit: Int, offset: Int): [Report]
    getReportById(id: ID!): Report
    getReportEntries(
      reportId: ID
      startDate: String
      endDate: String
      limit: Int
      offset: Int
    ): [ReportEntry]
  }

  type Mutation {
    logReport(
      word: String!
      category: String
      context: String
      severity: Int
    ): ReportEntry
    generateReport(startDate: String!, endDate: String!, title: String): Report
  }
`

module.exports = typeDefs

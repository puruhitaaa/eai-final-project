const { gql } = require("apollo-server")

const typeDefs = gql`
  type SentimentAnalysis @key(fields: "id") {
    id: ID!
    text: String!
    sentiment: String
    appropriatenessScore: Float
    toxicityScore: Float
    professionalismScore: Float
    review: String
    analysisDate: String
    aiGenerated: Boolean
  }

  type Query {
    analyzeSentiment(text: String!): SentimentAnalysis
    getRecentAnalyses(limit: Int): [SentimentAnalysis]
    getSentimentAnalysis(id: ID!): SentimentAnalysis
  }

  # Define additional types
  type SentimentResponse {
    success: Boolean!
    analysis: SentimentAnalysis
    message: String
  }
`

module.exports = typeDefs

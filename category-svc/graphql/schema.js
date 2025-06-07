const { gql } = require("apollo-server")

const typeDefs = gql`
  extend type FlaggedWord @key(fields: "word") {
    word: String! @external
    category: String
  }

  type Category {
    id: ID!
    name: String!
    description: String
    severityLevel: Int
  }

  type WordCategoryResult {
    word: String!
    category: String
    description: String
    severityLevel: Int
    confidence: Float
    explanation: String
  }

  type Query {
    getCategoryForWord(word: String!, context: String): WordCategoryResult
    getAllCategories: [Category]
  }

  type Mutation {
    createCategory(
      name: String!
      description: String
      severityLevel: Int
    ): Category
    saveWordCategory(
      word: String!
      categoryId: ID!
      confidence: Float
    ): WordCategoryResult
  }
`

module.exports = typeDefs

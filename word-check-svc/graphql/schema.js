const { gql } = require("apollo-server")

const typeDefs = gql`
  type FlaggedWord @key(fields: "word") {
    word: String!
    severity: Int
    contextDependent: Boolean
    aiDetectable: Boolean
    geminiExplanation: String
  }

  type Query {
    checkText(input: String!): [FlaggedWord]
    getAllProfaneWords: [FlaggedWord]
  }

  type Mutation {
    addProfaneWord(
      word: String!
      severity: Int
      contextDependent: Boolean
    ): FlaggedWord
  }
`

module.exports = typeDefs

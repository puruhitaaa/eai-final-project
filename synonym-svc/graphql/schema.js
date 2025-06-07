const { gql } = require("apollo-server")

const typeDefs = gql`
  extend type FlaggedWord @key(fields: "word") {
    word: String! @external
    suggestions: [String]
  }

  type Synonym {
    word: String!
    suggestions: [String]
    appropriatenessScore: Int
    lastUpdated: String
  }

  type Query {
    getSuggestions(word: String!, context: String): [String]
    getAllSynonyms: [Synonym]
  }

  type Mutation {
    saveSynonyms(
      word: String!
      synonyms: [String]!
      appropriatenessScore: Int
    ): Synonym
  }
`

module.exports = typeDefs

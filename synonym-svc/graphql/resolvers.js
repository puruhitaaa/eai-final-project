const synonymService = require("../services/synonym-service")

const resolvers = {
  Query: {
    getSuggestions: async (_, { word, context }) => {
      return await synonymService.getSuggestions(word, context)
    },
    getAllSynonyms: async () => {
      return await synonymService.getAllSynonyms()
    },
  },
  Mutation: {
    saveSynonyms: async (_, { word, synonyms, appropriatenessScore }) => {
      return await synonymService.saveSynonyms(
        word,
        synonyms,
        appropriatenessScore
      )
    },
  },
  FlaggedWord: {
    __resolveReference(reference) {
      // This is used by Apollo Federation to resolve references from other services
      return synonymService.getSynonymsByWord(reference.word)
    },
    suggestions(flaggedWord) {
      return synonymService.getSuggestions(flaggedWord.word)
    },
  },
}

module.exports = resolvers

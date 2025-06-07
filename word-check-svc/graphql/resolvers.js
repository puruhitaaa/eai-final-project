const wordCheckService = require("../services/word-check-service")

const resolvers = {
  Query: {
    checkText: async (_, { input }) => {
      return await wordCheckService.checkText(input)
    },
    getAllProfaneWords: async () => {
      return await wordCheckService.getAllProfaneWords()
    },
  },
  Mutation: {
    addProfaneWord: async (_, { word, severity, contextDependent }) => {
      return await wordCheckService.addProfaneWord(
        word,
        severity,
        contextDependent
      )
    },
  },
  FlaggedWord: {
    __resolveReference(reference) {
      // This is used by Apollo Federation to resolve references from other services
      // It would typically fetch the FlaggedWord from our database by id
      return wordCheckService.getWordById(reference.word)
    },
  },
}

module.exports = resolvers

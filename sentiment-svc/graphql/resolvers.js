const sentimentService = require("../services/sentiment-service")

const resolvers = {
  Query: {
    analyzeSentiment: async (_, { text }) => {
      return await sentimentService.analyzeSentiment(text)
    },
    getRecentAnalyses: async (_, { limit }) => {
      return await sentimentService.getRecentAnalyses(limit)
    },
    getSentimentAnalysis: async (_, { id }) => {
      return await sentimentService.getAnalysisById(id)
    },
  },
  SentimentAnalysis: {
    __resolveReference: async (ref) => {
      const { id } = ref
      return await sentimentService.getAnalysisById(id)
    },
  },
}

module.exports = resolvers

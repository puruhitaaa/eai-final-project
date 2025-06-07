const categoryService = require("../services/category-service")

const resolvers = {
  Query: {
    getCategoryForWord: async (_, { word, context }) => {
      return await categoryService.getCategoryForWord(word, context)
    },
    getAllCategories: async () => {
      return await categoryService.getAllCategories()
    },
  },
  Mutation: {
    createCategory: async (_, { name, description, severityLevel }) => {
      return await categoryService.createCategory(
        name,
        description,
        severityLevel
      )
    },
    saveWordCategory: async (_, { word, categoryId, confidence }) => {
      await categoryService.saveWordCategory(word, categoryId, confidence)
      return await categoryService.getCategoryForWord(word)
    },
  },
  FlaggedWord: {
    __resolveReference(reference) {
      // This is used by Apollo Federation to resolve references from other services
      return categoryService.getCategoryForWord(reference.word)
    },
    category(flaggedWord) {
      return categoryService
        .getCategoryForWord(flaggedWord.word)
        .then((result) => (result ? result.category : null))
    },
  },
}

module.exports = resolvers

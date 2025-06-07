const { Category, WordCategory } = require("../models")
const geminiService = require("./gemini-service")
const { Op } = require("sequelize")

class CategoryService {
  async getCategoryForWord(word, context = null) {
    if (!word || word.trim().length === 0) {
      return null
    }

    // First try to find existing category in the database
    const existingWordCategory = await WordCategory.findOne({
      where: { word: word.toLowerCase() },
      include: [Category],
    })

    if (existingWordCategory && existingWordCategory.Category) {
      return {
        word,
        category: existingWordCategory.Category.name,
        description: existingWordCategory.Category.description,
        severityLevel: existingWordCategory.Category.severityLevel,
        confidence: existingWordCategory.confidence,
      }
    }

    // If not found, use Gemini AI to categorize
    const aiResult = await geminiService.categorizeWord(word, context)

    if (aiResult && aiResult.category && aiResult.category !== "none") {
      // Find the category in our database
      const category = await Category.findOne({
        where: { name: aiResult.category.toLowerCase() },
      })

      if (category) {
        // Store the AI-generated categorization in the database for future use
        await this.saveWordCategory(
          word,
          category.id,
          aiResult.confidence || 0.7,
          true
        )

        return {
          word,
          category: category.name,
          description: category.description,
          severityLevel: category.severityLevel,
          confidence: aiResult.confidence || 0.7,
          explanation: aiResult.explanation,
        }
      }
    }

    return { word, category: null }
  }

  async saveWordCategory(
    word,
    categoryId,
    confidence = 1.0,
    aiGenerated = false
  ) {
    // Update or create word-category entry
    const [wordCategory, created] = await WordCategory.findOrCreate({
      where: { word: word.toLowerCase() },
      defaults: {
        CategoryId: categoryId,
        confidence,
        aiGenerated,
        lastUpdated: new Date(),
      },
    })

    if (!created) {
      // Update existing entry
      wordCategory.CategoryId = categoryId
      wordCategory.confidence = confidence
      wordCategory.aiGenerated = aiGenerated
      wordCategory.lastUpdated = new Date()
      await wordCategory.save()
    }

    return wordCategory
  }

  async getAllCategories() {
    return await Category.findAll()
  }

  async createCategory(name, description, severityLevel) {
    return await Category.create({
      name: name.toLowerCase(),
      description,
      severityLevel: severityLevel || 1,
    })
  }
}

module.exports = new CategoryService()

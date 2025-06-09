const { Synonym } = require("../models")
const geminiService = require("./gemini-service")
const { Op } = require("sequelize")

class SynonymService {
  async getSuggestions(word, context = null) {
    if (!word || word.trim().length === 0) {
      return []
    }

    // First try to find existing synonyms in the database
    const existingSynonym = await Synonym.findOne({
      where: { word: word.toLowerCase() },
    })

    if (existingSynonym && existingSynonym.synonyms.length > 0) {
      return existingSynonym.synonyms
    }

    // If not found or no synonyms, use Gemini AI to generate suggestions
    const aiResult = await geminiService.getSynonyms(word, context)

    // Store the AI-generated synonyms in the database for future use
    if (aiResult && aiResult.suggestions && aiResult.suggestions.length > 0) {
      await this.saveSynonyms(
        word,
        aiResult.suggestions,
        aiResult.appropriatenessScore
      )
      return aiResult.suggestions
    }

    return []
  }

  async saveSynonyms(word, synonyms, appropriatenessScore = 50) {
    // Update or create synonym entry
    const [synonym, created] = await Synonym.findOrCreate({
      where: { word: word.toLowerCase() },
      defaults: {
        synonyms,
        appropriatenessScore: appropriatenessScore || 50,
        lastUpdated: new Date(),
      },
    })

    if (!created) {
      // Update existing entry
      synonym.synonyms = synonyms
      synonym.appropriatenessScore =
        appropriatenessScore || synonym.appropriatenessScore
      synonym.lastUpdated = new Date()
      await synonym.save()
    }

    return synonym
  }

  async getAllSynonyms() {
    return await Synonym.findAll()
  }

  async getSynonymsByWord(word) {
    if (!word) return { word, suggestions: [] }

    const synonym = await Synonym.findOne({
      where: { word: word.toLowerCase() },
    })

    if (synonym) {
      return {
        word: synonym.word,
        suggestions: synonym.synonyms,
      }
    }

    return { word, suggestions: [] }
  }
}

module.exports = new SynonymService()

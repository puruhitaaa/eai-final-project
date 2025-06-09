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
    // Ensure appropriatenessScore is within the valid range (0-100)
    let validScore = appropriatenessScore || 50
    validScore = Math.min(100, Math.max(0, validScore))

    // Update or create synonym entry
    const [synonym, created] = await Synonym.findOrCreate({
      where: { word: word.toLowerCase() },
      defaults: {
        synonyms,
        appropriatenessScore: validScore,
        lastUpdated: new Date(),
      },
    })

    if (!created) {
      // Update existing entry
      synonym.synonyms = synonyms

      // Only update the score if a new valid one was provided
      if (appropriatenessScore !== undefined) {
        synonym.appropriatenessScore = validScore
      }

      synonym.lastUpdated = new Date()
      await synonym.save()
    }

    return synonym
  }

  async getAllSynonyms() {
    const synonyms = await Synonym.findAll()
    return synonyms.map((synonym) => {
      // Ensure appropriatenessScore is within 0-100 range
      const score =
        synonym.appropriatenessScore !== null &&
        synonym.appropriatenessScore !== undefined
          ? Math.min(100, Math.max(0, synonym.appropriatenessScore))
          : 50

      return {
        word: synonym.word,
        suggestions: synonym.synonyms || [],
        appropriatenessScore: score,
        lastUpdated: synonym.lastUpdated,
      }
    })
  }

  async getSynonymsByWord(word) {
    if (!word) return { word, suggestions: [] }

    const synonym = await Synonym.findOne({
      where: { word: word.toLowerCase() },
    })

    if (synonym) {
      return {
        word: synonym.word,
        suggestions: synonym.synonyms || [],
        appropriatenessScore:
          synonym.appropriatenessScore !== null
            ? Math.min(100, Math.max(0, synonym.appropriatenessScore))
            : 50,
      }
    }

    return { word, suggestions: [] }
  }
}

module.exports = new SynonymService()

const { ProfaneWord } = require("../models")
const geminiService = require("./gemini-service")
const { Op } = require("sequelize")

class WordCheckService {
  async checkText(text) {
    if (!text || text.trim().length === 0) {
      return []
    }

    // Get all profane words from the database
    const profaneWords = await ProfaneWord.findAll()

    // Simple regex check for direct matches
    const directMatches = this.findDirectMatches(text, profaneWords)

    // Use Gemini AI for context-aware profanity detection
    const aiResult = await geminiService.analyzeProfanity(text)

    // Combine results from direct matching and AI detection
    return this.combineResults(directMatches, aiResult, text)
  }

  findDirectMatches(text, profaneWords) {
    const matches = []
    const lowerText = text.toLowerCase()

    profaneWords.forEach((profaneWord) => {
      const word = profaneWord.word.toLowerCase()
      if (lowerText.includes(word)) {
        matches.push({
          word: profaneWord.word,
          severity: profaneWord.severity,
          contextDependent: profaneWord.contextDependent,
          aiDetectable: profaneWord.aiDetectable,
        })
      }
    })

    return matches
  }

  combineResults(directMatches, aiResult, originalText) {
    const results = [...directMatches]

    // Add AI detected words if any
    if (aiResult && aiResult.flaggedWords && aiResult.flaggedWords.length > 0) {
      aiResult.flaggedWords.forEach((flagged) => {
        // Check if this word is already in results
        const existing = results.find(
          (r) => r.word.toLowerCase() === flagged.word.toLowerCase()
        )

        if (!existing) {
          results.push({
            word: flagged.word,
            geminiExplanation: flagged.explanation,
            severity: 2, // Default severity for AI detected words
            contextDependent: true,
            aiDetectable: true,
          })
        } else {
          // Update existing entry with AI explanation
          existing.geminiExplanation = flagged.explanation
        }
      })
    }

    return results
  }

  async addProfaneWord(word, severity, contextDependent) {
    return await ProfaneWord.create({
      word,
      severity: severity || 1,
      contextDependent: contextDependent || false,
      aiDetectable: true,
    })
  }

  async getAllProfaneWords() {
    return await ProfaneWord.findAll()
  }

  async getWordById(word) {
    // Find profane word by the word string itself
    const profaneWord = await ProfaneWord.findOne({
      where: { word },
    })

    if (profaneWord) {
      return {
        word: profaneWord.word,
        severity: profaneWord.severity,
        contextDependent: profaneWord.contextDependent,
        aiDetectable: profaneWord.aiDetectable,
      }
    }

    // Return a minimal object if not found
    return { word }
  }
}

module.exports = new WordCheckService()

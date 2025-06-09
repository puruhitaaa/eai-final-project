const { ProfaneWord } = require("../models")
const geminiService = require("./gemini-service")
const categoryClient = require("./category-client")
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
    const results = this.combineResults(directMatches, aiResult, text)

    // Process detected words for categorization and storage
    await this.processFlaggedWords(results, text)

    return results
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
            severity: flagged.severity || 2, // Use Gemini's severity rating or default to 2
            contextDependent: true,
            aiDetectable: true,
          })
        } else {
          // Update existing entry with AI explanation
          existing.geminiExplanation = flagged.explanation
          // Optionally update severity if AI provides it and it's higher
          if (flagged.severity && flagged.severity > existing.severity) {
            existing.severity = flagged.severity
          }
        }
      })
    }

    return results
  }

  async processFlaggedWords(flaggedWords, context) {
    if (!flaggedWords || flaggedWords.length === 0) return

    // Get all available categories
    const categories = await categoryClient.getAllCategories()
    const categoryMap = {}
    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        categoryMap[cat.name] = cat.id
      })
    }

    // Process each flagged word
    for (const word of flaggedWords) {
      try {
        // 1. Save to ProfaneWord DB if not exists
        const existingWord = await ProfaneWord.findOne({
          where: { word: word.word },
        })

        if (!existingWord) {
          await ProfaneWord.create({
            word: word.word,
            severity: word.severity || 2,
            contextDependent: word.contextDependent || true,
            aiDetectable: word.aiDetectable || true,
          })
          console.log(`Added new profane word to database: ${word.word}`)
        }

        // 2. Get category from category service
        let wordCategory = await categoryClient.getCategoryForWord(
          word.word,
          context
        )

        // If no category found, determine category based on severity
        if (!wordCategory || !wordCategory.category) {
          let categoryName
          const severity = word.severity || 2

          // Map severity to category
          if (severity >= 5) {
            categoryName = "racial" // Highest severity
          } else if (severity >= 4) {
            categoryName = "abusive"
          } else if (severity >= 3) {
            categoryName = "sexual"
          } else {
            categoryName = "mild"
          }

          // Check if category exists, create if not
          let categoryId = categoryMap[categoryName]
          if (!categoryId) {
            const descriptions = {
              racial: "Content that discriminates based on race or ethnicity",
              sexual: "Sexually explicit or inappropriate content",
              abusive: "Content that is abusive, threatening or harassing",
              mild: "Mildly inappropriate language",
            }

            const newCategory = await categoryClient.createCategory(
              categoryName,
              descriptions[categoryName] || `${categoryName} content`,
              severity
            )

            if (newCategory) {
              categoryId = newCategory.id
              categoryMap[categoryName] = categoryId
            }
          }

          // Save word-category association
          if (categoryId) {
            const confidence = 80 // Default confidence for system-determined categories
            await categoryClient.saveWordCategory(
              word.word,
              categoryId,
              confidence
            )
            console.log(`Categorized word "${word.word}" as "${categoryName}"`)
          }
        }
      } catch (error) {
        console.error(`Error processing flagged word ${word.word}:`, error)
      }
    }
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

const { SentimentAnalysis } = require("../models")
const geminiService = require("./gemini-service")
const { Op } = require("sequelize")

class SentimentService {
  async analyzeSentiment(text) {
    if (!text || text.trim().length === 0) {
      return {
        sentiment: "neutral",
        appropriatenessScore: 50,
        toxicityScore: 0,
        professionalismScore: 50,
        review: "Text is empty or contains only whitespace.",
      }
    }

    try {
      // First try to find existing analysis in the database
      const existingAnalysis = await SentimentAnalysis.findOne({
        where: { text: text },
      })

      if (existingAnalysis) {
        console.log(
          `Found existing analysis for text: ${text.substring(0, 20)}...`
        )
        // Return existing analysis
        return {
          id: existingAnalysis.id,
          text: existingAnalysis.text,
          sentiment: existingAnalysis.sentiment,
          appropriatenessScore: existingAnalysis.appropriatenessScore,
          toxicityScore: existingAnalysis.toxicityScore,
          professionalismScore: existingAnalysis.professionalismScore,
          review: existingAnalysis.review,
          analysisDate: existingAnalysis.analysisDate,
          aiGenerated: existingAnalysis.aiGenerated,
        }
      }
    } catch (error) {
      console.error("Error searching for existing analysis:", error.message)
      // Continue with new analysis
    }

    // If not found, use Gemini AI to analyze
    console.log(`Analyzing new text: ${text.substring(0, 20)}...`)
    const aiResult = await geminiService.analyzeSentiment(text)

    if (aiResult) {
      // Store the AI-generated analysis in the database for future use
      try {
        const newAnalysis = await SentimentAnalysis.create({
          text: text,
          sentiment: aiResult.sentiment,
          appropriatenessScore: aiResult.appropriatenessScore,
          toxicityScore: aiResult.toxicityScore,
          professionalismScore: aiResult.professionalismScore,
          review: aiResult.review,
          aiGenerated: true,
        })

        console.log(`Stored new analysis with ID: ${newAnalysis.id}`)
        return {
          id: newAnalysis.id,
          text: newAnalysis.text,
          sentiment: newAnalysis.sentiment,
          appropriatenessScore: newAnalysis.appropriatenessScore,
          toxicityScore: newAnalysis.toxicityScore,
          professionalismScore: newAnalysis.professionalismScore,
          review: newAnalysis.review,
          analysisDate: newAnalysis.analysisDate,
          aiGenerated: newAnalysis.aiGenerated,
        }
      } catch (error) {
        console.error("Error saving analysis to database:", error.message)

        // Still return the AI result even if saving fails
        return {
          text: text,
          sentiment: aiResult.sentiment,
          appropriatenessScore: aiResult.appropriatenessScore,
          toxicityScore: aiResult.toxicityScore,
          professionalismScore: aiResult.professionalismScore,
          review: aiResult.review,
          aiGenerated: true,
          analysisDate: new Date(),
        }
      }
    }

    // Fallback
    return {
      text: text,
      sentiment: "neutral",
      appropriatenessScore: 50,
      toxicityScore: 0,
      professionalismScore: 50,
      review: "Unable to analyze text.",
      aiGenerated: false,
      analysisDate: new Date(),
    }
  }

  async getRecentAnalyses(limit = 10) {
    try {
      return await SentimentAnalysis.findAll({
        order: [["analysisDate", "DESC"]],
        limit: limit,
      })
    } catch (error) {
      console.error("Error fetching recent analyses:", error.message)
      return []
    }
  }

  async getAnalysisById(id) {
    try {
      return await SentimentAnalysis.findByPk(id)
    } catch (error) {
      console.error(`Error fetching analysis with ID ${id}:`, error.message)
      return null
    }
  }
}

module.exports = new SentimentService()

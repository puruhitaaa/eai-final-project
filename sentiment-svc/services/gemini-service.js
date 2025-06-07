const { GoogleGenerativeAI } = require("@google/generative-ai")
require("dotenv").config()

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn(
        "WARNING: GEMINI_API_KEY is not set. Gemini AI features will not work."
      )
      this.isAvailable = false
      return
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    this.isAvailable = true
  }

  async analyzeSentiment(text) {
    if (!this.isAvailable) {
      return {
        sentiment: "neutral",
        appropriatenessScore: 50,
        toxicityScore: 0,
        professionalismScore: 50,
        review:
          "Gemini AI service is not available. Please check your API key.",
      }
    }

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
      // Limit text length to prevent token usage issues
      const truncatedText =
        text.length > 500 ? `${text.substring(0, 497)}...` : text

      // Generate prompt for sentiment analysis
      const prompt = `
        Analyze the following text and provide a JSON response with these properties:
        - sentiment: "positive", "negative", or "neutral"
        - appropriatenessScore: a number between 0 and 100 where 100 is most appropriate
        - toxicityScore: a number between 0 and 100 where 100 is most toxic
        - professionalismScore: a number between 0 and 100 where 100 is most professional
        - review: a brief analysis explaining these scores
        
        Evaluate the text for appropriateness, toxicity, and professionalism. Consider factors like:
        - Offensive language or hate speech (reduces appropriateness, increases toxicity)
        - Formal vs. informal language (affects professionalism)
        - Tone and emotion expressed (affects sentiment)
        - Context suitability
        
        TEXT TO ANALYZE: "${truncatedText}"
        
        RESPONSE JSON:
      `

      // Call Gemini API
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const textResult = response.text()

      // Extract the JSON part of the response
      const jsonMatch = textResult.match(/({[\s\S]*})/)
      if (jsonMatch && jsonMatch[1]) {
        try {
          const analysisResult = JSON.parse(jsonMatch[1])

          // Validate and normalize scores to ensure they're within 0-100 range
          analysisResult.appropriatenessScore = this.normalizeScore(
            analysisResult.appropriatenessScore
          )
          analysisResult.toxicityScore = this.normalizeScore(
            analysisResult.toxicityScore
          )
          analysisResult.professionalismScore = this.normalizeScore(
            analysisResult.professionalismScore
          )

          return analysisResult
        } catch (e) {
          console.error("Error parsing Gemini response:", e)
        }
      }

      // Fallback if parsing fails
      return {
        sentiment: "neutral",
        appropriatenessScore: 50,
        toxicityScore: 0,
        professionalismScore: 50,
        review: "Unable to analyze the text content.",
        rawResponse: textResult,
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return {
        sentiment: "neutral",
        appropriatenessScore: 50,
        toxicityScore: 0,
        professionalismScore: 50,
        review: "An error occurred during analysis.",
        error: error.message,
      }
    }
  }

  // Helper function to ensure scores are between 0 and 100
  normalizeScore(score) {
    if (typeof score !== "number") {
      return 50
    }
    return Math.max(0, Math.min(100, score))
  }
}

module.exports = new GeminiService()

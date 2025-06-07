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
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" })
    this.isAvailable = true
  }

  async analyzeProfanity(text) {
    if (!this.isAvailable) {
      return {
        containsProfanity: false,
        explanation:
          "Gemini AI service is not available. Please check your API key.",
      }
    }

    try {
      // Generate a prompt that asks Gemini to analyze the text for profanity
      const prompt = `
        Analyze the following text for any profane, offensive, or inappropriate words or phrases:
        "${text}"
        
        Respond with JSON in the following format:
        {
          "containsProfanity": boolean,
          "flaggedWords": [
            {
              "word": "word or phrase that was flagged",
              "explanation": "brief explanation of why this is considered profane"
            }
          ]
        }
        
        If no profanity is detected, return an empty array for flaggedWords.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const textResult = response.text()

      // Extract the JSON part of the response
      const jsonMatch = textResult.match(/({[\s\S]*})/)
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1])
        } catch (e) {
          console.error("Error parsing Gemini response:", e)
          return {
            containsProfanity: false,
            flaggedWords: [],
            error: "Failed to parse AI response",
          }
        }
      }

      return {
        containsProfanity: false,
        flaggedWords: [],
        rawResponse: textResult,
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return {
        containsProfanity: false,
        flaggedWords: [],
        error: error.message,
      }
    }
  }
}

module.exports = new GeminiService()

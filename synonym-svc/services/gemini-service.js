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

  async getSynonyms(word, context = null) {
    if (!this.isAvailable) {
      return {
        suggestions: [],
        error: "Gemini AI service is not available. Please check your API key.",
      }
    }

    try {
      // Generate a prompt that asks Gemini to suggest alternatives
      let prompt = `
        Suggest 5 appropriate non-offensive alternatives for the potentially offensive word or phrase: "${word}"
        
        If context is provided, make sure the suggestions fit within that context.
        ${context ? `Context: "${context}"` : ""}
        
        Respond with JSON in the following format:
        {
          "suggestions": [
            "alternative1",
            "alternative2",
            "alternative3",
            "alternative4",
            "alternative5"
          ],
          "appropriatenessScore": number (0-100, where 0 is least appropriate and 100 is most appropriate)
        }
        
        The appropriatenessScore should reflect how appropriate the original word is:
        - Score 0-20: Highly inappropriate/offensive terms
        - Score 21-40: Moderately inappropriate terms
        - Score 41-60: Slightly inappropriate or context-dependent terms
        - Score 61-80: Generally appropriate terms with rare exceptions
        - Score 81-100: Completely appropriate terms
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const textResult = response.text()

      // Extract the JSON part of the response
      const jsonMatch = textResult.match(/({[\s\S]*})/)
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1])

          // Ensure the appropriatenessScore is within the valid range
          if (parsed.appropriatenessScore !== undefined) {
            parsed.appropriatenessScore = Math.min(
              100,
              Math.max(0, parsed.appropriatenessScore)
            )
          } else {
            parsed.appropriatenessScore = 50 // Default middle value
          }

          return parsed
        } catch (e) {
          console.error("Error parsing Gemini response:", e)
          return {
            suggestions: [],
            error: "Failed to parse AI response",
            appropriatenessScore: 50,
          }
        }
      }

      return {
        suggestions: [],
        rawResponse: textResult,
        appropriatenessScore: 50,
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return {
        suggestions: [],
        error: error.message,
        appropriatenessScore: 50,
      }
    }
  }
}

module.exports = new GeminiService()

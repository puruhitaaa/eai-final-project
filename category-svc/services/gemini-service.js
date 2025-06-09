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

  async categorizeWord(word, context = null) {
    if (!this.isAvailable) {
      return {
        category: null,
        confidence: 0,
        error: "Gemini AI service is not available. Please check your API key.",
      }
    }

    try {
      // Generate a prompt that asks Gemini to categorize the word
      let prompt = `
        Categorize the following potentially offensive word or phrase: "${word}"
        
        If context is provided, use it to better understand the usage.
        ${context ? `Context: "${context}"` : ""}
        
        Choose from these categories:
        1. racial - Content that discriminates based on race or ethnicity
        2. sexual - Sexually explicit or inappropriate content
        3. abusive - Content that is abusive, threatening or harassing
        4. mild - Mildly inappropriate language
        5. none - Not offensive at all
        
        Respond with JSON in the following format:
        {
          "category": "category_name",
          "confidence": number (0-100, where 100 is complete confidence),
          "explanation": "brief explanation of why this category was chosen"
        }
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
            category: null,
            confidence: 0,
            error: "Failed to parse AI response",
          }
        }
      }

      return {
        category: null,
        confidence: 0,
        rawResponse: textResult,
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return {
        category: null,
        confidence: 0,
        error: error.message,
      }
    }
  }
}

module.exports = new GeminiService()

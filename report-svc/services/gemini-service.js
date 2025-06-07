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

  async generateReportSummary(reportEntries, startDate, endDate) {
    if (!this.isAvailable) {
      return {
        summary:
          "Gemini AI service is not available. Please check your API key.",
        insights: [],
      }
    }

    if (!reportEntries || reportEntries.length === 0) {
      return {
        summary: "No profanity detected during this period.",
        insights: [],
      }
    }

    try {
      // Prepare data for the prompt
      const categoryBreakdown = {}
      reportEntries.forEach((entry) => {
        if (entry.category) {
          if (!categoryBreakdown[entry.category]) {
            categoryBreakdown[entry.category] = 0
          }
          categoryBreakdown[entry.category]++
        }
      })

      const categoryBreakdownText = Object.entries(categoryBreakdown)
        .map(([category, count]) => `${category}: ${count} occurrences`)
        .join("\n")

      // Generate a prompt that asks Gemini to analyze the report data
      let prompt = `
        Generate a professional summary and insights for a profanity detection report with the following data:
        
        Time period: ${new Date(startDate).toLocaleDateString()} to ${new Date(
        endDate
      ).toLocaleDateString()}
        Total flagged words: ${reportEntries.length}
        
        Category breakdown:
        ${categoryBreakdownText}
        
        Top flagged words:
        ${reportEntries
          .slice(0, 10)
          .map(
            (entry) => `"${entry.word}" (${entry.category || "uncategorized"})`
          )
          .join(", ")}
        
        Respond with JSON in the following format:
        {
          "summary": "A concise 2-3 sentence summary of the report findings",
          "insights": [
            "Key insight 1 about trends or patterns",
            "Key insight 2 about trends or patterns",
            "Key insight 3 about recommendations"
          ],
          "riskAssessment": "Low/Medium/High risk assessment based on the data"
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
            summary: "Error generating AI summary.",
            insights: [],
          }
        }
      }

      return {
        summary: "Generated summary unavailable.",
        insights: [],
        rawResponse: textResult,
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return {
        summary: `Error: ${error.message}`,
        insights: [],
      }
    }
  }
}

module.exports = new GeminiService()

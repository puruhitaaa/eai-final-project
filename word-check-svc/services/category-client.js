const fetch = require("node-fetch")

class CategoryClient {
  constructor() {
    this.baseUrl = "http://category:4003/graphql"
  }

  async getCategoryForWord(word, context = null) {
    try {
      const query = `
        query GetCategoryForWord($word: String!, $context: String) {
          getCategoryForWord(word: $word, context: $context) {
            word
            category
            description
            severityLevel
            confidence
            explanation
          }
        }
      `

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { word, context },
        }),
      })

      const result = await response.json()
      if (result.errors) {
        console.error("Error getting category for word:", result.errors)
        return null
      }

      return result.data.getCategoryForWord
    } catch (error) {
      console.error("Failed to communicate with category service:", error)
      return null
    }
  }

  async saveWordCategory(word, categoryId, confidence = 90) {
    try {
      const mutation = `
        mutation SaveWordCategory($word: String!, $categoryId: ID!, $confidence: Float) {
          saveWordCategory(word: $word, categoryId: $categoryId, confidence: $confidence) {
            word
            category
            confidence
          }
        }
      `

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: mutation,
          variables: { word, categoryId, confidence },
        }),
      })

      const result = await response.json()
      if (result.errors) {
        console.error("Error saving word category:", result.errors)
        return null
      }

      return result.data.saveWordCategory
    } catch (error) {
      console.error("Failed to communicate with category service:", error)
      return null
    }
  }

  async getAllCategories() {
    try {
      const query = `
        query GetAllCategories {
          getAllCategories {
            id
            name
            description
            severityLevel
          }
        }
      `

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
        }),
      })

      const result = await response.json()
      if (result.errors) {
        console.error("Error getting all categories:", result.errors)
        return []
      }

      return result.data.getAllCategories
    } catch (error) {
      console.error("Failed to communicate with category service:", error)
      return []
    }
  }

  async createCategory(name, description, severityLevel) {
    try {
      const mutation = `
        mutation CreateCategory($name: String!, $description: String, $severityLevel: Int) {
          createCategory(name: $name, description: $description, severityLevel: $severityLevel) {
            id
            name
            description
            severityLevel
          }
        }
      `

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: mutation,
          variables: { name, description, severityLevel },
        }),
      })

      const result = await response.json()
      if (result.errors) {
        console.error("Error creating category:", result.errors)
        return null
      }

      return result.data.createCategory
    } catch (error) {
      console.error("Failed to communicate with category service:", error)
      return null
    }
  }
}

module.exports = new CategoryClient()

const express = require("express")
const cors = require("cors")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const rateLimit = require("express-rate-limit")
const NodeCache = require("node-cache")
require("dotenv").config()

// Initialize Express
const app = express()
app.use(cors())
app.use(express.json())

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable is not set")
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

// Setup cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 })

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again after a minute",
})

app.use(limiter)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Gemini Proxy is running" })
})

// Proxy endpoint for Gemini API
app.post("/generate", async (req, res) => {
  try {
    const { prompt, cacheKey } = req.body

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    // Check cache if cacheKey is provided
    if (cacheKey && cache.has(cacheKey)) {
      console.log(`Cache hit for key: ${cacheKey}`)
      return res.json(cache.get(cacheKey))
    }

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const textResult = response.text()

    const responseData = {
      text: textResult,
      timestamp: new Date().toISOString(),
    }

    // Store in cache if cacheKey is provided
    if (cacheKey) {
      cache.set(cacheKey, responseData)
      console.log(`Cached response for key: ${cacheKey}`)
    }

    res.json(responseData)
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    res.status(500).json({ error: error.message })
  }
})

// Start server
const PORT = process.env.PORT || 4005
app.listen(PORT, () => {
  console.log(`🚀 Gemini Proxy running on port ${PORT}`)
})

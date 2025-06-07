# Profanity Checker System

A modular and scalable profanity checker system using microservices architecture with GraphQL, Docker, PostgreSQL, and Google Gemini AI integration.

## Architecture

This system consists of 4 main microservices:

1. **WordCheckSvc**: Core service that checks if given text contains profane words
2. **SynonymSvc**: Suggests alternative words for flagged content
3. **CategorySvc**: Tags flagged words into offensive categories (racial, sexual, abusive, etc.)
4. **ReportSvc**: Logs flagged words and generates analytical reports

Each service has its own PostgreSQL database and integrates with Google Gemini AI to enhance its capabilities.

## Technologies

- **Node.js**: For service implementation
- **Apollo GraphQL & Federation**: For API development and unified schema
- **Docker & Docker Compose**: For containerization
- **PostgreSQL**: For data persistence
- **Google Gemini AI**: For enhanced NLP capabilities

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Google Gemini API key

### Installation

1. Clone this repository
2. Set your Gemini API key as an environment variable:
   ```
   export GEMINI_API_KEY=your_api_key_here
   ```
3. Build and start the services:
   ```
   npm run build
   npm start
   ```
4. Access the GraphQL playground at `http://localhost:4000/graphql`

## Usage Examples

```graphql
# Check text for profanity
query {
  checkText(input: "your text here") {
    word
    category
    suggestions
    geminiExplanation
  }
}

# Get reports
query {
  getReports(startDate: "2023-01-01", endDate: "2023-12-31") {
    id
    summary
    flaggedWords
    categories {
      name
      count
    }
  }
}
```

## Service Details

Each service is built with the same stack but serves different purposes:

- **WordCheckSvc**: Uses Gemini AI to detect context-aware profanity
- **SynonymSvc**: Uses Gemini AI to suggest smart alternatives
- **CategorySvc**: Uses Gemini AI to categorize offensive content
- **ReportSvc**: Uses Gemini AI to generate insights from logs

## License

MIT

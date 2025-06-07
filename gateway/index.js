const { ApolloServer } = require("apollo-server")
const { ApolloGateway } = require("@apollo/gateway")
require("dotenv").config()

// Define service list for Apollo Federation
const gateway = new ApolloGateway({
  serviceList: [
    {
      name: "word-check",
      url: `http://word-check:4001/graphql`,
    },
    {
      name: "synonym",
      url: `http://synonym:4002/graphql`,
    },
    {
      name: "category",
      url: `http://category:4003/graphql`,
    },
    {
      name: "report",
      url: `http://report:4004/graphql`,
    },
  ],
  experimental_pollInterval: 1000, // Poll every second until all subgraphs are available
})

// Initialize Apollo Server with the gateway
const server = new ApolloServer({
  gateway,
  subscriptions: false,
  context: ({ req }) => {
    // We could add authentication here if needed in the future
    return { headers: req.headers }
  },
})

// Start the server
const PORT = process.env.PORT || 4000
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`)
  console.log(`Connected to microservices:
  - Word Check Service
  - Synonym Service
  - Category Service
  - Report Service`)
})

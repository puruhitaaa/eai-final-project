const { ApolloServer } = require("apollo-server")
const { buildFederatedSchema } = require("@apollo/federation")
const typeDefs = require("./graphql/schema")
const resolvers = require("./graphql/resolvers")
require("./models") // Initialize database and models
require("dotenv").config()

// Create Apollo Server with Federation
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  context: ({ req }) => {
    return { headers: req.headers }
  },
})

// Start the server
const PORT = process.env.PORT || 4002
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Synonym Service ready at ${url}`)
})

const express = require('express');
// Import Apollo Server
const { ApolloServer } = require('apollo-server-express')
const path = require('path');

// Import schemas
const { typeDefs, resolvers } = require('./schemas');

// call Middleware
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');

// Set port access for localhost and Heroku
const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`GraphQL access at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
/**
 * Jest global setup - Start MongoDB Memory Server
 */
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Store the URI and server instance in global for teardown and tests
  global.__MONGO_URI__ = mongoUri;
  global.__MONGO_SERVER__ = mongoServer;

  // Set environment variable for the app to use
  process.env.MONGODB_URI = mongoUri;
};

/**
 * Jest test setup - Connect to MongoDB Memory Server
 */
const mongoose = require('mongoose');

// Connect to in-memory MongoDB before all tests in this file
beforeAll(async () => {
  // Set the MongoDB URI from global setup
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set. Make sure globalSetup ran correctly.');
  }

  // Connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

// Clear all collections after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// Disconnect after all tests in this file
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

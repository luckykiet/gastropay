/**
 * Jest global teardown - Stop MongoDB Memory Server
 */
module.exports = async () => {
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
  }
};

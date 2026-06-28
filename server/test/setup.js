const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const path = require("path");

// Load env BEFORE any module imports
process.env.NODE_ENV = "test";
process.env.CORS_ORIGIN = "http://localhost:3001";
process.env.enc_secret = "test-secret-key-for-jwt";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.DB_URL = uri;

  await mongoose.connect(uri);
  await mongoose.syncIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

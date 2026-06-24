const mockRedis = {
  get: jest.fn(() => Promise.resolve(null)),
  set: jest.fn(() => Promise.resolve("OK")),
  setEx: jest.fn(() => Promise.resolve("OK")),
  del: jest.fn(() => Promise.resolve(1)),
  keys: jest.fn(() => Promise.resolve([])),
  exists: jest.fn(() => Promise.resolve(0)),
  expire: jest.fn(() => Promise.resolve(1)),
  on: jest.fn(),
  connect: jest.fn(() => Promise.resolve()),
  quit: jest.fn(() => Promise.resolve()),
  isOpen: false,
};

module.exports = mockRedis;

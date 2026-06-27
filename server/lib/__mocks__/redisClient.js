const mockRedis = {
  get: jest.fn(() => Promise.resolve(null)),
  set: jest.fn(() => Promise.resolve("OK")),
  setEx: jest.fn(() => Promise.resolve("OK")),
  setNX: jest.fn(() => Promise.resolve(true)),
  del: jest.fn(() => Promise.resolve(1)),
  keys: jest.fn(() => Promise.resolve([])),
  exists: jest.fn(() => Promise.resolve(0)),
  expire: jest.fn(() => Promise.resolve(1)),
  sAdd: jest.fn(() => Promise.resolve(1)),
  sIsMember: jest.fn(() => Promise.resolve(0)),
  on: jest.fn(),
  connect: jest.fn(() => Promise.resolve()),
  quit: jest.fn(() => Promise.resolve()),
  isOpen: false,
};

module.exports = mockRedis;

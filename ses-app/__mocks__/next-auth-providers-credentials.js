module.exports = {
  default: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials',
    credentials: {},
    authorize: jest.fn(),
  })),
}; 
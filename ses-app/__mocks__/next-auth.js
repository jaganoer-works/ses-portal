module.exports = {
  getServerSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  auth: jest.fn(),
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
  default: jest.fn(() => ({
    handlers: {
      GET: jest.fn(),
      POST: jest.fn(),
    },
    signIn: jest.fn(),
    signOut: jest.fn(),
    auth: jest.fn(),
  })),
};

// CredentialsProviderのモック
module.exports.providers = {
  credentials: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials',
    credentials: {},
    authorize: jest.fn(),
  })),
}; 
module.exports = {
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  SessionProvider: ({ children }) => children,
}; 
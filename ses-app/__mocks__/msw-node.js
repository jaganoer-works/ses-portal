module.exports = {
  setupServer: jest.fn(() => ({
    listen: jest.fn(),
    close: jest.fn(),
    resetHandlers: jest.fn(),
    use: jest.fn(),
  })),
  http: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  HttpResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}; 
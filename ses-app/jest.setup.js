import '@testing-library/jest-dom'

// MSW (Mock Service Worker) のセットアップ - 一時的にコメントアウト
// import { server } from './src/__mocks__/server'

// テスト開始前にMSWサーバーを起動
// beforeAll(() => server.listen())

// 各テスト間でハンドラーをリセット
// afterEach(() => server.resetHandlers())

// テスト完了後にMSWサーバーを停止
// afterAll(() => server.close())

// Next.js router のモック
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
  useParams() {
    return {}
  },
}))

// NextAuth.js のモック
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// fetchのポリフィル（Node.js環境用）
// global.fetch = require('node-fetch')

// Node.js環境でのRequest APIポリフィル
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
    this.body = options.body;
  }

  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'));
  }
};

// Response APIポリフィル
global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new Map(Object.entries(options.headers || {}));
  }

  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'));
  }

  static json(data, options = {}) {
    return new Response(JSON.stringify(data), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
};

// NextResponse のモック
global.NextResponse = {
  json: (data, options = {}) => ({
    status: options.status || 200,
    json: () => Promise.resolve(data),
  }),
  redirect: (url) => ({
    status: 302,
    headers: { Location: url },
  }),
  next: () => ({
    status: 200,
  }),
};

// console.error のモック（テスト中のエラーログを抑制）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 
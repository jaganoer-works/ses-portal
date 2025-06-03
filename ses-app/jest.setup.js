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
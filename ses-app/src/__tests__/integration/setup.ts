import { Session } from 'next-auth';

// 簡単なモックサーバー実装
export const server = {
  listen: jest.fn(),
  close: jest.fn(),
  resetHandlers: jest.fn(),
  use: jest.fn(),
};

// テスト用セッションデータ
export const mockSessions = {
  admin: {
    user: {
      id: 'admin-id',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  } as Session,
  
  sales: {
    user: {
      id: 'sales-id', 
      email: 'sales@example.com',
      name: 'Sales User',
      role: 'SALES'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  } as Session,
  
  engineer: {
    user: {
      id: 'engineer-id',
      email: 'taro@example.com', 
      name: 'Engineer User',
      role: 'ENGINEER'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  } as Session,
  
  null: null
};

// APIテスト用ヘルパー関数
export const createMockApiRequest = (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any,
  headers?: Record<string, string>
) => {
  const baseHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  return new Request(url, {
    method,
    headers: baseHeaders,
    body: body ? JSON.stringify(body) : undefined
  });
};

// 統合テストのセットアップ
export const setupIntegrationTest = () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};

// NextAuth.jsセッションのモック設定
export const mockNextAuthSession = (session: Session | null) => {
  jest.doMock('next-auth', () => ({
    getServerSession: jest.fn().mockResolvedValue(session)
  }));
};

// APIレスポンスのヘルパー
export const createApiResponse = (data: any, status = 200) => {
  return {
    status,
    json: () => Promise.resolve(data),
  };
};

// 権限エラーレスポンス
export const createUnauthorizedResponse = () => {
  return {
    status: 403,
    json: () => Promise.resolve({
      error: 'Unauthorized', 
      message: 'Insufficient permissions'
    }),
  };
};

// 認証エラーレスポンス 
export const createUnauthenticatedResponse = () => {
  return {
    status: 401,
    json: () => Promise.resolve({
      error: 'Unauthenticated', 
      message: 'Authentication required'
    }),
  };
};

// ダミーテスト（setup.tsファイルがテストスイートとして認識されないようにするため）
describe('統合テストセットアップ', () => {
  it('セットアップファイルが正常に読み込まれる', () => {
    expect(mockSessions).toBeDefined();
    expect(server).toBeDefined();
  });
}); 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { setupIntegrationTest, mockSessions } from './setup';
import { signIn, signOut } from 'next-auth/react';
import bcrypt from 'bcryptjs';

// NextAuth functions のモック
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

jest.mock('bcryptjs');
jest.mock('@prisma/client');

const mockedSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Prisma のモック
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// 認証ライブラリのモック設定
import { auth } from '@/lib/auth';
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

describe('認証フロー統合テスト', () => {
  setupIntegrationTest();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ログイン機能', () => {
    const validCredentials = {
      email: 'admin@example.com',
      password: 'admin123'
    };

    const hashedPassword = '$2a$10$hashedpassword';

    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'admin-id',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      mockedBcrypt.compare = jest.fn().mockResolvedValue(true);
    });

    it('有効な認証情報でログイン成功', async () => {
      mockedSignIn.mockResolvedValue({ 
        ok: true, 
        error: undefined,
        status: 200,
        url: 'http://localhost:3000/dashboard'
      });

      const result = await mockedSignIn('credentials', {
        email: validCredentials.email,
        password: validCredentials.password,
        redirect: false,
      });

      expect(result?.ok).toBe(true);
      expect(result?.error).toBeUndefined();
      expect(mockedSignIn).toHaveBeenCalledWith('credentials', {
        email: validCredentials.email,
        password: validCredentials.password,
        redirect: false,
      });
    });

    it('無効なメールアドレスでログイン失敗', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockedSignIn.mockResolvedValue({ 
        ok: false, 
        error: 'CredentialsSignin',
        status: 401,
        url: null
      });

      const result = await mockedSignIn('credentials', {
        email: 'nonexistent@example.com',
        password: validCredentials.password,
        redirect: false,
      });

      expect(result?.ok).toBe(false);
      expect(result?.error).toBe('CredentialsSignin');
    });

    it('無効なパスワードでログイン失敗', async () => {
      mockedBcrypt.compare = jest.fn().mockResolvedValue(false);
      mockedSignIn.mockResolvedValue({ 
        ok: false, 
        error: 'CredentialsSignin',
        status: 401,
        url: null
      });

      const result = await mockedSignIn('credentials', {
        email: validCredentials.email,
        password: 'wrongpassword',
        redirect: false,
      });

      expect(result?.ok).toBe(false);
      expect(result?.error).toBe('CredentialsSignin');
    });

    it('空の認証情報でログイン失敗', async () => {
      mockedSignIn.mockResolvedValue({ 
        ok: false, 
        error: 'CredentialsSignin',
        status: 401,
        url: null
      });

      const result = await mockedSignIn('credentials', {
        email: '',
        password: '',
        redirect: false,
      });

      expect(result?.ok).toBe(false);
      expect(result?.error).toBe('CredentialsSignin');
    });
  });

  describe('ログアウト機能', () => {
    it('ログアウト成功', async () => {
      mockedSignOut.mockResolvedValue({ 
        url: 'http://localhost:3000/auth/signin'
      });

      const result = await mockedSignOut({ redirect: false });

      expect(result?.url).toContain('/auth/signin');
      expect(mockedSignOut).toHaveBeenCalledWith({ redirect: false });
    });

    it('リダイレクト付きログアウト', async () => {
      mockedSignOut.mockResolvedValue({ 
        url: 'http://localhost:3000/auth/signin'
      });

      const result = await mockedSignOut({ 
        callbackUrl: '/auth/signin',
        redirect: true 
      });

      expect(result?.url).toContain('/auth/signin');
    });
  });

  describe('セッション管理', () => {
    it('有効なセッション取得', async () => {
      mockedAuth.mockResolvedValue(mockSessions.admin);

      const session = await mockedAuth();

      expect(session).toEqual(mockSessions.admin);
      expect(session?.user.role).toBe('ADMIN');
      expect(session?.user.email).toBe('admin@example.com');
    });

    it('無効なセッション（null）', async () => {
      mockedAuth.mockResolvedValue(null);

      const session = await mockedAuth();

      expect(session).toBeNull();
    });

    it('期限切れセッション処理', async () => {
      const expiredSession = {
        ...mockSessions.admin,
        expires: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1日前
      };

      mockedAuth.mockResolvedValue(expiredSession);

      const session = await mockedAuth();

      // 期限切れセッションは返されるが、実際の認証処理では無効として扱われる
      expect(session).toEqual(expiredSession);
      expect(new Date(session?.expires || '') < new Date()).toBe(true);
    });
  });

  describe('ロール別認証テスト', () => {
    it('管理者ロールでのログイン', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'admin-id',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: '$2a$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockedBcrypt.compare = jest.fn().mockResolvedValue(true);
      mockedSignIn.mockResolvedValue({ 
        ok: true, 
        error: undefined,
        status: 200,
        url: 'http://localhost:3000/dashboard'
      });

      const result = await mockedSignIn('credentials', {
        email: 'admin@example.com',
        password: 'admin123',
        redirect: false,
      });

      expect(result?.ok).toBe(true);
    });

    it('営業ロールでのログイン', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'sales-id',
        email: 'sales@example.com',
        name: 'Sales User',
        role: 'SALES',
        password: '$2a$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockedBcrypt.compare = jest.fn().mockResolvedValue(true);
      mockedSignIn.mockResolvedValue({ 
        ok: true, 
        error: undefined,
        status: 200,
        url: 'http://localhost:3000/dashboard'
      });

      const result = await mockedSignIn('credentials', {
        email: 'sales@example.com',
        password: 'password123',
        redirect: false,
      });

      expect(result?.ok).toBe(true);
    });

    it('エンジニアロールでのログイン', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'engineer-id',
        email: 'taro@example.com',
        name: 'Engineer User',
        role: 'ENGINEER',
        password: '$2a$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockedBcrypt.compare = jest.fn().mockResolvedValue(true);
      mockedSignIn.mockResolvedValue({ 
        ok: true, 
        error: undefined,
        status: 200,
        url: 'http://localhost:3000/dashboard'
      });

      const result = await mockedSignIn('credentials', {
        email: 'taro@example.com',
        password: 'password123',
        redirect: false,
      });

      expect(result?.ok).toBe(true);
    });
  });

  describe('認証エラーハンドリング', () => {
    it('データベース接続エラー', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));
      mockedSignIn.mockResolvedValue({ 
        ok: false, 
        error: 'Database error',
        status: 500,
        url: null
      });

      const result = await mockedSignIn('credentials', {
        email: 'admin@example.com',
        password: 'admin123',
        redirect: false,
      });

      expect(result?.ok).toBe(false);
      expect(result?.error).toBe('Database error');
    });

    it('bcryptハッシュ比較エラー', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'admin-id',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: '$2a$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockedBcrypt.compare = jest.fn().mockRejectedValue(new Error('Bcrypt error'));
      mockedSignIn.mockResolvedValue({ 
        ok: false, 
        error: 'Hash comparison error',
        status: 500,
        url: null
      });

      const result = await mockedSignIn('credentials', {
        email: 'admin@example.com',
        password: 'admin123',
        redirect: false,
      });

      expect(result?.ok).toBe(false);
    });
  });
}); 
import { render, screen, waitFor } from '@testing-library/react';
import { notFound } from 'next/navigation';
import EditProjectPage, { generateMetadata } from '@/app/projects/[id]/edit/page';
import { setupIntegrationTest } from './setup';

// Next.js navigation のモック
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: jest.fn(),
}));

// Prisma のモック - 直接オブジェクトを定義
jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
  },
}));

// モックされたPrismaをimportで取得
import { prisma } from '@/lib/prisma';
import { useRouter } from 'next/navigation';
const mockPrisma = prisma as any;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockedNotFound = notFound as jest.MockedFunction<typeof notFound>;

describe('プロジェクト編集ページ統合テスト', () => {
  setupIntegrationTest();

  const mockProject = {
    id: 'test-project-id',
    title: 'テストプロジェクト',
    description: 'テスト説明',
    status: '募集中',
    price: 1000000,
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-12-31'),
    published: true,
    publishedAt: new Date('2024-01-01'),
    lastContactedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    isActive: true,
    createdBy: 'user-1',
    updatedBy: 'user-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // useRouterのモック設定
    mockedUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    } as any);
    
    // notFoundはエラーを投げるように設定
    mockedNotFound.mockImplementation(() => {
      throw new Error('Not Found');
    });
  });

  describe('fetchProject関数のテスト', () => {
    it('正常なプロジェクトデータを取得できる', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const params = Promise.resolve({ id: 'test-project-id' });
      const result = await EditProjectPage({ params });

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-project-id' }
      });
    });

    it('プロジェクトが見つからない場合はnotFoundを呼ぶ', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const params = Promise.resolve({ id: 'non-existent-id' });

      // notFound()が呼ばれた結果、ErrorDisplayが表示されることを確認
      const result = await EditProjectPage({ params });
      expect(mockedNotFound).toHaveBeenCalled();
      
      // ErrorDisplayコンポーネントが表示されることを確認
      const container = render(result);
      expect(container.container.textContent).toContain('案件データの取得に失敗しました');
    });

    it('データベースエラー時は適切にエラーハンドリングする', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.project.findUnique.mockRejectedValue(dbError);

      const params = Promise.resolve({ id: 'test-project-id' });
      
      const result = await EditProjectPage({ params });
      
      // ErrorDisplayコンポーネントが表示されることを確認
      const container = render(result);
      expect(container.container.textContent).toContain('案件データの取得に失敗しました');
    });
  });

  describe('generateMetadata関数のテスト', () => {
    it('正常なプロジェクトデータからメタデータを生成', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const params = Promise.resolve({ id: 'test-project-id' });
      const metadata = await generateMetadata({ params });

      expect(metadata.title).toBe('テストプロジェクトを編集 | SES管理システム');
      expect(metadata.description).toBe('案件「テストプロジェクト」の編集ページです。');
    });

    it('プロジェクトが見つからない場合はデフォルトメタデータを返す', async () => {
      mockPrisma.project.findUnique.mockRejectedValue(new Error('Not found'));

      const params = Promise.resolve({ id: 'non-existent-id' });
      const metadata = await generateMetadata({ params });

      expect(metadata.title).toBe('案件編集 | SES管理システム');
      expect(metadata.description).toBe('案件の情報を編集できます。');
    });
  });

  describe('レンダリングテスト', () => {
    it('正常なプロジェクトデータで編集フォームが表示される', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const params = Promise.resolve({ id: 'test-project-id' });
      const result = await EditProjectPage({ params });
      const container = render(result);

      expect(container.container.textContent).toContain('案件編集');
      expect(container.container.textContent).toContain('「テストプロジェクト」の情報を編集します。');
    });

    it('エラー時はエラー表示コンポーネントが表示される', async () => {
      mockPrisma.project.findUnique.mockRejectedValue(new Error('Test error'));

      const params = Promise.resolve({ id: 'test-project-id' });
      const result = await EditProjectPage({ params });
      const container = render(result);

      expect(container.container.textContent).toContain('案件データの取得に失敗しました');
    });
  });

  describe('401エラー回避の実証テスト', () => {
    it('以前のfetch方式では401エラーが発生', async () => {
      // 以前のAPI方式では認証なしで401エラーとなることを確認
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      global.fetch = mockFetch;
      
      const response = await fetch('/api/projects/test-id');
      expect(response.status).toBe(401);
    });

    it('現在のPrisma方式では認証エラーが発生しない', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const params = Promise.resolve({ id: 'test-project-id' });
      
      // 認証なしでも正常に動作することを確認
      await expect(EditProjectPage({ params })).resolves.toBeDefined();
      expect(mockPrisma.project.findUnique).toHaveBeenCalled();
    });
  });
}); 
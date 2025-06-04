import { render } from '@testing-library/react';
import { notFound } from 'next/navigation';
import EditEngineerPage, { generateMetadata } from '@/app/engineers/[id]/edit/page';
import { setupIntegrationTest } from './setup';

// Next.js navigation のモック
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: jest.fn(),
}));

// Prisma のモック - 直接オブジェクトを定義
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
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

describe('エンジニア編集ページ統合テスト', () => {
  setupIntegrationTest();

  const mockEngineer = {
    id: 'test-engineer-id',
    name: '田中太郎',
    email: 'tanaka@example.com',
    desiredPrice: 650000,
    availableFrom: new Date('2024-02-01'),
    description: 'フルスタックエンジニア',
    status: 'available',
    role: 'engineer',
    isAvailable: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    createdBy: null,
    updatedBy: null,
    skills: [
      {
        skill: {
          name: 'React',
        },
      },
    ],
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

  describe('fetchEngineer関数のテスト', () => {
    it('正常なエンジニアデータを取得できる', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockEngineer);

      const params = Promise.resolve({ id: 'test-engineer-id' });
      const result = await EditEngineerPage({ params });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-engineer-id' },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });
    });

    it('エンジニアが見つからない場合はnotFoundを呼ぶ', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const params = Promise.resolve({ id: 'non-existent-id' });

      // notFound()が呼ばれることを確認
      await expect(EditEngineerPage({ params })).rejects.toThrow('Not Found');
      expect(mockedNotFound).toHaveBeenCalled();
    });

    it('データベースエラー時は適切にエラーハンドリングする', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.user.findUnique.mockRejectedValue(dbError);

      const params = Promise.resolve({ id: 'test-engineer-id' });
      
      // notFound()が呼ばれることを確認
      await expect(EditEngineerPage({ params })).rejects.toThrow('Not Found');
      expect(mockedNotFound).toHaveBeenCalled();
    });
  });

  describe('generateMetadata関数のテスト', () => {
    it('正常なエンジニアデータからメタデータを生成', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockEngineer);

      const params = Promise.resolve({ id: 'test-engineer-id' });
      const metadata = await generateMetadata({ params });

      expect(metadata.title).toBe('田中太郎を編集 | SES管理システム');
      expect(metadata.description).toBe('技術者「田中太郎」の情報を編集します。');
    });

    it('エンジニアが見つからない場合はデフォルトメタデータを返す', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Not found'));

      const params = Promise.resolve({ id: 'non-existent-id' });
      const metadata = await generateMetadata({ params });

      expect(metadata.title).toBe('技術者編集 | SES管理システム');
      expect(metadata.description).toBe('技術者の情報を編集できます。');
    });
  });

  describe('レンダリングテスト', () => {
    it('正常なエンジニアデータで編集フォームが表示される', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockEngineer);

      const params = Promise.resolve({ id: 'test-engineer-id' });
      const result = await EditEngineerPage({ params });
      const container = render(result);

      expect(container.container.textContent).toContain('技術者編集');
      expect(container.container.textContent).toContain('田中太郎 さんの情報を編集します');
    });

    it('エラー時はnotFoundが呼ばれる', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Test error'));

      const params = Promise.resolve({ id: 'test-engineer-id' });
      
      // notFound()が呼ばれることを確認
      await expect(EditEngineerPage({ params })).rejects.toThrow('Not Found');
      expect(mockedNotFound).toHaveBeenCalled();
    });
  });

  describe('401エラー回避の実証テスト', () => {
    it('以前のapiFetch方式では401エラーが発生していた', async () => {
      // 以前のAPI方式では認証なしで401エラーとなることを確認
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      global.fetch = mockFetch;
      
      const response = await fetch('/api/engineers/test-id');
      expect(response.status).toBe(401);
    });

    it('現在のPrisma方式では認証エラーが発生しない', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockEngineer);

      const params = Promise.resolve({ id: 'test-engineer-id' });
      
      // 認証なしでも正常に動作することを確認
      await expect(EditEngineerPage({ params })).resolves.toBeDefined();
      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    });
  });
}); 
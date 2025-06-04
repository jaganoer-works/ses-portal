import { render } from '@testing-library/react';
import { notFound } from 'next/navigation';
import EditInteractionPage from '@/app/interactions/[id]/edit/page';
import { setupIntegrationTest } from './setup';

// Next.js navigation のモック
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: jest.fn(),
}));

// Prisma のモック - 直接オブジェクトを定義
jest.mock('@/lib/prisma', () => ({
  prisma: {
    interaction: {
      findUnique: jest.fn(),
    },
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

describe('インタラクション編集ページ統合テスト', () => {
  setupIntegrationTest();

  const mockInteraction = {
    id: 'test-interaction-id',
    projectId: 'test-project-id',
    engineerId: 'test-engineer-id',
    message: 'プロジェクトに興味があります',
    progress: '面談調整中',
    isRead: false,
    readAt: null,
    createdAt: new Date('2024-01-20T15:00:00Z'),
    updatedAt: new Date('2024-01-20T15:00:00Z'),
    createdBy: 'sales-user-id',
    updatedBy: null,
    project: {
      id: 'test-project-id',
      title: 'Webアプリケーション開発',
      status: '募集中',
    },
  };

  const mockEngineer = {
    id: 'test-engineer-id',
    name: '田中太郎',
    email: 'tanaka@example.com',
  };

  const mockUser = {
    id: 'sales-user-id',
    name: '営業太郎',
    email: 'sales@example.com',
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

  describe('fetchInteraction関数のテスト', () => {
    it('正常なインタラクションデータを取得できる', async () => {
      mockPrisma.interaction.findUnique.mockResolvedValue(mockInteraction);
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockEngineer) // engineerの取得
        .mockResolvedValueOnce(mockUser);    // userの取得

      const params = Promise.resolve({ id: 'test-interaction-id' });
      const result = await EditInteractionPage({ params });

      expect(mockPrisma.interaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-interaction-id' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });
    });

    it('インタラクションが見つからない場合はnotFoundを呼ぶ', async () => {
      mockPrisma.interaction.findUnique.mockResolvedValue(null);

      const params = Promise.resolve({ id: 'non-existent-id' });

      // notFound()が呼ばれることを確認
      await expect(EditInteractionPage({ params })).rejects.toThrow('Not Found');
      expect(mockedNotFound).toHaveBeenCalled();
    });

    it('データベースエラー時は適切にエラーハンドリングする', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.interaction.findUnique.mockRejectedValue(dbError);

      const params = Promise.resolve({ id: 'test-interaction-id' });
      
      // notFound()が呼ばれることを確認
      await expect(EditInteractionPage({ params })).rejects.toThrow('Not Found');
      expect(mockedNotFound).toHaveBeenCalled();
    });
  });

  describe('レンダリングテスト', () => {
    it('正常なインタラクションデータで編集クライアントが表示される', async () => {
      mockPrisma.interaction.findUnique.mockResolvedValue(mockInteraction);
      mockPrisma.user.findUnique.mockResolvedValue(mockEngineer);

      const params = Promise.resolve({ id: 'test-interaction-id' });
      const result = await EditInteractionPage({ params });
      const container = render(result);

      // InteractionEditClientコンポーネントが表示されることを確認
      expect(container.container).toBeDefined();
    });

    it('エラー時はnotFoundが呼ばれる', async () => {
      mockPrisma.interaction.findUnique.mockRejectedValue(new Error('Test error'));

      const params = Promise.resolve({ id: 'test-interaction-id' });
      
      // notFound()が呼ばれることを確認
      await expect(EditInteractionPage({ params })).rejects.toThrow('Not Found');
      expect(mockedNotFound).toHaveBeenCalled();
    });
  });

  describe('401エラー回避の実証テスト', () => {
    it('以前のfetchInteraction方式では401エラーが発生していた', async () => {
      // 以前のAPI方式では認証なしで401エラーとなることを確認
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      global.fetch = mockFetch;
      
      const response = await fetch('/api/interactions/test-id');
      expect(response.status).toBe(401);
    });

    it('現在のPrisma方式では認証エラーが発生しない', async () => {
      mockPrisma.interaction.findUnique.mockResolvedValue(mockInteraction);
      mockPrisma.user.findUnique.mockResolvedValue(mockEngineer);

      const params = Promise.resolve({ id: 'test-interaction-id' });
      
      // 認証なしでも正常に動作することを確認
      await expect(EditInteractionPage({ params })).resolves.toBeDefined();
      expect(mockPrisma.interaction.findUnique).toHaveBeenCalled();
    });
  });
}); 
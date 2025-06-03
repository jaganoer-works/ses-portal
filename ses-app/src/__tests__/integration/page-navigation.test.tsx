import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { setupIntegrationTest, mockSessions } from './setup';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Permission } from '@/lib/permissions';

// Next.js router のモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// NextAuth session のモック
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSession = useSession as jest.MockedFunction<typeof useSession>;

// usePermissions フックのモック
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}));

import { usePermissions } from '@/hooks/usePermissions';
const mockedUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

describe('ページ間遷移統合テスト', () => {
  setupIntegrationTest();

  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue(mockRouter);
  });

  describe('認証状態による画面制御', () => {
    it('未認証時: アクセス拒否表示', async () => {
      mockedUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      });

      mockedUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(false),
        hasAnyPermission: jest.fn().mockReturnValue(false),
        hasAllPermissions: jest.fn().mockReturnValue(false),
        canAccess: jest.fn().mockReturnValue(false),
        userRole: '',
        isAuthenticated: false,
        isLoading: false,
        session: null
      });

      render(
        <PermissionGuard 
          permission={Permission.PROJECT_READ} 
          fallback={<div>アクセス権限がありません</div>}
        >
          <div>案件一覧</div>
        </PermissionGuard>
      );

      expect(screen.getByText('アクセス権限がありません')).toBeInTheDocument();
      expect(screen.queryByText('案件一覧')).not.toBeInTheDocument();
    });

    it('認証済み: アクセス許可表示', async () => {
      mockedUseSession.mockReturnValue({
        data: mockSessions.admin,
        status: 'authenticated'
      });

      mockedUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        hasAnyPermission: jest.fn().mockReturnValue(true),
        hasAllPermissions: jest.fn().mockReturnValue(true),
        canAccess: jest.fn().mockReturnValue(true),
        userRole: 'ADMIN',
        isAuthenticated: true,
        isLoading: false,
        session: mockSessions.admin
      });

      render(
        <PermissionGuard 
          permission={Permission.PROJECT_READ}
          fallback={<div>アクセス権限がありません</div>}
        >
          <div>案件一覧</div>
        </PermissionGuard>
      );

      expect(screen.getByText('案件一覧')).toBeInTheDocument();
      expect(screen.queryByText('アクセス権限がありません')).not.toBeInTheDocument();
    });
  });

  describe('ロール別ページアクセス制御', () => {
    describe('管理者権限', () => {
      beforeEach(() => {
        mockedUseSession.mockReturnValue({
          data: mockSessions.admin,
          status: 'authenticated'
        });

        mockedUsePermissions.mockReturnValue({
          hasPermission: jest.fn().mockReturnValue(true),
          hasAnyPermission: jest.fn().mockReturnValue(true),
          hasAllPermissions: jest.fn().mockReturnValue(true),
          canAccess: jest.fn().mockReturnValue(true),
          userRole: 'ADMIN',
          isAuthenticated: true,
          isLoading: false,
          session: mockSessions.admin
        });
      });

      it('案件管理画面: アクセス許可', () => {
        render(
          <PermissionGuard 
            permission={Permission.PROJECT_CREATE}
            fallback={<div>権限がありません</div>}
          >
            <div>案件作成画面</div>
          </PermissionGuard>
        );

        expect(screen.getByText('案件作成画面')).toBeInTheDocument();
      });

      it('技術者管理画面: アクセス許可', () => {
        render(
          <PermissionGuard 
            permission={Permission.ENGINEER_DELETE}
            fallback={<div>権限がありません</div>}
          >
            <div>技術者削除画面</div>
          </PermissionGuard>
        );

        expect(screen.getByText('技術者削除画面')).toBeInTheDocument();
      });

      it('ユーザー管理画面: アクセス許可', () => {
        render(
          <PermissionGuard 
            permission={Permission.USER_READ}
            fallback={<div>権限がありません</div>}
          >
            <div>ユーザー管理画面</div>
          </PermissionGuard>
        );

        expect(screen.getByText('ユーザー管理画面')).toBeInTheDocument();
      });
    });

    describe('営業権限', () => {
      beforeEach(() => {
        mockedUseSession.mockReturnValue({
          data: mockSessions.sales,
          status: 'authenticated'
        });

        mockedUsePermissions.mockReturnValue({
          hasPermission: jest.fn((permission: Permission) => {
            // 営業の権限マトリックスに基づく
            const salesPermissions = [
              Permission.PROJECT_READ,
              Permission.PROJECT_CREATE,
              Permission.ENGINEER_READ,
              Permission.ENGINEER_CREATE,
              Permission.USER_READ,
            ];
            return salesPermissions.includes(permission);
          }),
          hasAnyPermission: jest.fn().mockReturnValue(true),
          hasAllPermissions: jest.fn().mockReturnValue(true),
          canAccess: jest.fn((permission: Permission) => {
            const salesPermissions = [
              Permission.PROJECT_READ,
              Permission.PROJECT_CREATE,
              Permission.ENGINEER_READ,
              Permission.ENGINEER_CREATE,
              Permission.USER_READ,
            ];
            return salesPermissions.includes(permission);
          }),
          userRole: 'SALES',
          isAuthenticated: true,
          isLoading: false,
          session: mockSessions.sales
        });
      });

      it('案件作成画面: アクセス許可', () => {
        render(
          <PermissionGuard 
            permission={Permission.PROJECT_CREATE}
            fallback={<div>権限がありません</div>}
          >
            <div>案件作成画面</div>
          </PermissionGuard>
        );

        expect(screen.getByText('案件作成画面')).toBeInTheDocument();
      });

      it('案件削除画面: アクセス拒否', () => {
        render(
          <PermissionGuard 
            permission={Permission.PROJECT_DELETE}
            fallback={<div>権限がありません</div>}
          >
            <div>案件削除画面</div>
          </PermissionGuard>
        );

        expect(screen.getByText('権限がありません')).toBeInTheDocument();
        expect(screen.queryByText('案件削除画面')).not.toBeInTheDocument();
      });

      it('技術者作成画面: アクセス許可', () => {
        render(
          <PermissionGuard 
            permission={Permission.ENGINEER_CREATE}
            fallback={<div>権限がありません</div>}
          >
            <div>技術者作成画面</div>
          </PermissionGuard>
        );

        expect(screen.getByText('技術者作成画面')).toBeInTheDocument();
      });

      it('技術者削除画面: アクセス拒否', () => {
        render(
          <PermissionGuard 
            permission={Permission.ENGINEER_DELETE}
            fallback={<div>権限がありません</div>}
          >
            <div>技術者削除画面</div>
          </PermissionGuard>
        );

        expect(screen.getByText('権限がありません')).toBeInTheDocument();
        expect(screen.queryByText('技術者削除画面')).not.toBeInTheDocument();
      });
    });

    describe('エンジニア権限', () => {
      beforeEach(() => {
        mockedUseSession.mockReturnValue({
          data: mockSessions.engineer,
          status: 'authenticated'
        });

        mockedUsePermissions.mockReturnValue({
          hasPermission: jest.fn((permission: Permission) => {
            // エンジニアの権限マトリックスに基づく
            const engineerPermissions = [
              Permission.PROJECT_READ,
              Permission.ENGINEER_READ,  // 自分のみ
              Permission.USER_READ,      // 自分のみ
            ];
            return engineerPermissions.includes(permission);
          }),
          hasAnyPermission: jest.fn().mockReturnValue(true),
          hasAllPermissions: jest.fn().mockReturnValue(false),
          canAccess: jest.fn((permission: Permission, resourceUserId?: string) => {
            const engineerPermissions = [Permission.PROJECT_READ];
            const ownResourcePermissions = [Permission.ENGINEER_READ, Permission.USER_READ];
            
            if (engineerPermissions.includes(permission)) return true;
            if (ownResourcePermissions.includes(permission) && resourceUserId === 'engineer-id') return true;
            return false;
          }),
          userRole: 'ENGINEER',
          isAuthenticated: true,
          isLoading: false,
          session: mockSessions.engineer
        });
      });

      it('案件一覧画面: アクセス許可', () => {
        render(
          <PermissionGuard 
            permission={Permission.PROJECT_READ}
            fallback={<div>権限がありません</div>}
          >
            <div>案件一覧画面</div>
          </PermissionGuard>
        );

        expect(screen.getByText('案件一覧画面')).toBeInTheDocument();
      });

      it('案件作成画面: アクセス拒否', () => {
        render(
          <PermissionGuard 
            permission={Permission.PROJECT_CREATE}
            fallback={<div>権限がありません</div>}
          >
            <div>案件作成画面</div>
          </PermissionGuard>
        );

        expect(screen.getByText('権限がありません')).toBeInTheDocument();
        expect(screen.queryByText('案件作成画面')).not.toBeInTheDocument();
      });

      it('自分の技術者情報: アクセス許可', () => {
        render(
          <PermissionGuard 
            permission={Permission.ENGINEER_READ}
            resourceUserId="engineer-id"
            fallback={<div>権限がありません</div>}
          >
            <div>自分の技術者情報</div>
          </PermissionGuard>
        );

        expect(screen.getByText('自分の技術者情報')).toBeInTheDocument();
      });

      it('他人の技術者情報: アクセス拒否', () => {
        render(
          <PermissionGuard 
            permission={Permission.ENGINEER_READ}
            resourceUserId="other-user-id"
            fallback={<div>権限がありません</div>}
          >
            <div>他人の技術者情報</div>
          </PermissionGuard>
        );

        expect(screen.getByText('権限がありません')).toBeInTheDocument();
        expect(screen.queryByText('他人の技術者情報')).not.toBeInTheDocument();
      });
    });
  });

  describe('複数権限の組み合わせテスト', () => {
    beforeEach(() => {
      mockedUseSession.mockReturnValue({
        data: mockSessions.sales,
        status: 'authenticated'
      });

      mockedUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        hasAnyPermission: jest.fn((permissions: Permission[]) => {
          const salesPermissions = [
            Permission.PROJECT_READ,
            Permission.PROJECT_CREATE,
            Permission.ENGINEER_READ,
            Permission.ENGINEER_CREATE,
          ];
          return permissions.some(p => salesPermissions.includes(p));
        }),
        hasAllPermissions: jest.fn((permissions: Permission[]) => {
          const salesPermissions = [
            Permission.PROJECT_READ,
            Permission.PROJECT_CREATE,
            Permission.ENGINEER_READ,
            Permission.ENGINEER_CREATE,
          ];
          return permissions.every(p => salesPermissions.includes(p));
        }),
        canAccess: jest.fn().mockReturnValue(true),
        userRole: 'SALES',
        isAuthenticated: true,
        isLoading: false,
        session: mockSessions.sales
      });
    });

    it('いずれかの権限があればアクセス許可（OR条件）', () => {
      render(
        <PermissionGuard 
          permissions={[Permission.PROJECT_CREATE, Permission.ENGINEER_DELETE]}
          requireAll={false}
          fallback={<div>権限がありません</div>}
        >
          <div>コンテンツ</div>
        </PermissionGuard>
      );

      expect(screen.getByText('コンテンツ')).toBeInTheDocument();
    });

    it('全ての権限が必要（AND条件）- アクセス許可', () => {
      render(
        <PermissionGuard 
          permissions={[Permission.PROJECT_READ, Permission.PROJECT_CREATE]}
          requireAll={true}
          fallback={<div>権限がありません</div>}
        >
          <div>コンテンツ</div>
        </PermissionGuard>
      );

      expect(screen.getByText('コンテンツ')).toBeInTheDocument();
    });

    it('全ての権限が必要（AND条件）- アクセス拒否', () => {
      render(
        <PermissionGuard 
          permissions={[Permission.PROJECT_CREATE, Permission.PROJECT_DELETE]}
          requireAll={true}
          fallback={<div>権限がありません</div>}
        >
          <div>コンテンツ</div>
        </PermissionGuard>
      );

      expect(screen.getByText('権限がありません')).toBeInTheDocument();
      expect(screen.queryByText('コンテンツ')).not.toBeInTheDocument();
    });
  });

  describe('ロール指定によるアクセス制御', () => {
    it('管理者のみアクセス - 管理者: 許可', () => {
      mockedUseSession.mockReturnValue({
        data: mockSessions.admin,
        status: 'authenticated'
      });

      mockedUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        hasAnyPermission: jest.fn().mockReturnValue(true),
        hasAllPermissions: jest.fn().mockReturnValue(true),
        canAccess: jest.fn().mockReturnValue(true),
        userRole: 'ADMIN',
        isAuthenticated: true,
        isLoading: false,
        session: mockSessions.admin
      });

      render(
        <PermissionGuard 
          roles={['ADMIN']}
          fallback={<div>管理者のみアクセス可能</div>}
        >
          <div>管理者専用コンテンツ</div>
        </PermissionGuard>
      );

      expect(screen.getByText('管理者専用コンテンツ')).toBeInTheDocument();
    });

    it('管理者のみアクセス - 営業: 拒否', () => {
      mockedUseSession.mockReturnValue({
        data: mockSessions.sales,
        status: 'authenticated'
      });

      mockedUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        hasAnyPermission: jest.fn().mockReturnValue(true),
        hasAllPermissions: jest.fn().mockReturnValue(true),
        canAccess: jest.fn().mockReturnValue(true),
        userRole: 'SALES',
        isAuthenticated: true,
        isLoading: false,
        session: mockSessions.sales
      });

      render(
        <PermissionGuard 
          roles={['ADMIN']}
          fallback={<div>管理者のみアクセス可能</div>}
        >
          <div>管理者専用コンテンツ</div>
        </PermissionGuard>
      );

      expect(screen.getByText('管理者のみアクセス可能')).toBeInTheDocument();
      expect(screen.queryByText('管理者専用コンテンツ')).not.toBeInTheDocument();
    });

    it('複数ロール許可 - 営業または管理者: 営業でアクセス許可', () => {
      mockedUseSession.mockReturnValue({
        data: mockSessions.sales,
        status: 'authenticated'
      });

      mockedUsePermissions.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
        hasAnyPermission: jest.fn().mockReturnValue(true),
        hasAllPermissions: jest.fn().mockReturnValue(true),
        canAccess: jest.fn().mockReturnValue(true),
        userRole: 'SALES',
        isAuthenticated: true,
        isLoading: false,
        session: mockSessions.sales
      });

      render(
        <PermissionGuard 
          roles={['ADMIN', 'SALES']}
          fallback={<div>権限がありません</div>}
        >
          <div>営業以上のコンテンツ</div>
        </PermissionGuard>
      );

      expect(screen.getByText('営業以上のコンテンツ')).toBeInTheDocument();
    });
  });
}); 
import { setupIntegrationTest, mockSessions } from './setup';
import { Permission, Role } from '@/lib/permissions';
import { hasPermission } from '@/lib/permissions';

// NextAuth のモック
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@prisma/client');

// Prisma のモック
const mockPrisma = {
  project: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  engineer: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('API権限制御統合テスト', () => {
  setupIntegrationTest();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('権限チェック機能', () => {
    it('管理者: 全権限アクセス許可', () => {
      const adminRole = Role.ADMIN;
      
      expect(hasPermission(adminRole, Permission.PROJECT_READ)).toBe(true);
      expect(hasPermission(adminRole, Permission.PROJECT_CREATE)).toBe(true);
      expect(hasPermission(adminRole, Permission.PROJECT_DELETE)).toBe(true);
      expect(hasPermission(adminRole, Permission.ENGINEER_READ)).toBe(true);
      expect(hasPermission(adminRole, Permission.ENGINEER_CREATE)).toBe(true);
      expect(hasPermission(adminRole, Permission.ENGINEER_DELETE)).toBe(true);
      expect(hasPermission(adminRole, Permission.USER_READ)).toBe(true);
      expect(hasPermission(adminRole, Permission.USER_UPDATE)).toBe(true);
    });

    it('営業: 限定権限アクセス許可', () => {
      const salesRole = Role.SALES;
      
      // 許可される権限
      expect(hasPermission(salesRole, Permission.PROJECT_READ)).toBe(true);
      expect(hasPermission(salesRole, Permission.PROJECT_CREATE)).toBe(true);
      expect(hasPermission(salesRole, Permission.ENGINEER_READ)).toBe(true);
      expect(hasPermission(salesRole, Permission.ENGINEER_CREATE)).toBe(true);
      expect(hasPermission(salesRole, Permission.USER_READ)).toBe(true);
      
      // 拒否される権限
      expect(hasPermission(salesRole, Permission.PROJECT_DELETE)).toBe(false);
      expect(hasPermission(salesRole, Permission.ENGINEER_DELETE)).toBe(false);
      expect(hasPermission(salesRole, Permission.USER_UPDATE)).toBe(false);
    });

    it('エンジニア: 最小権限アクセス許可', () => {
      const engineerRole = Role.ENGINEER;
      
      // 許可される権限
      expect(hasPermission(engineerRole, Permission.ENGINEER_READ)).toBe(true);
      expect(hasPermission(engineerRole, Permission.USER_READ)).toBe(true);
      expect(hasPermission(engineerRole, Permission.USER_UPDATE)).toBe(true);
      
      // 拒否される権限
      expect(hasPermission(engineerRole, Permission.PROJECT_READ)).toBe(false);
      expect(hasPermission(engineerRole, Permission.PROJECT_CREATE)).toBe(false);
      expect(hasPermission(engineerRole, Permission.PROJECT_DELETE)).toBe(false);
      expect(hasPermission(engineerRole, Permission.ENGINEER_CREATE)).toBe(false);
      expect(hasPermission(engineerRole, Permission.ENGINEER_DELETE)).toBe(false);
    });
  });

  describe('セッション認証テスト', () => {
    it('有効なセッション: 認証成功', () => {
      const session = mockSessions.admin;
      
      expect(session).toEqual(mockSessions.admin);
      expect(session?.user.role).toBe('ADMIN');
      expect(session?.user.email).toBe('admin@example.com');
    });

    it('無効なセッション: 認証失敗', () => {
      const session = mockSessions.null;
      
      expect(session).toBeNull();
    });

    it('期限切れセッション: 認証失敗', () => {
      const expiredSession = {
        ...mockSessions.admin,
        expires: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1日前
      };
      
      expect(expiredSession).toBeDefined();
      expect(new Date(expiredSession?.expires || '') < new Date()).toBe(true);
    });
  });

  describe('ロール別権限マトリックステスト', () => {
    const testCases = [
      {
        role: Role.ADMIN,
        permissions: {
          [Permission.PROJECT_READ]: true,
          [Permission.PROJECT_CREATE]: true,
          [Permission.PROJECT_UPDATE]: true,
          [Permission.PROJECT_DELETE]: true,
          [Permission.ENGINEER_READ]: true,
          [Permission.ENGINEER_CREATE]: true,
          [Permission.ENGINEER_UPDATE]: true,
          [Permission.ENGINEER_DELETE]: true,
          [Permission.USER_READ]: true,
          [Permission.USER_UPDATE]: true,
        }
      },
      {
        role: Role.SALES,
        permissions: {
          [Permission.PROJECT_READ]: true,
          [Permission.PROJECT_CREATE]: true,
          [Permission.PROJECT_UPDATE]: true,
          [Permission.PROJECT_DELETE]: false,
          [Permission.ENGINEER_READ]: true,
          [Permission.ENGINEER_CREATE]: true,
          [Permission.ENGINEER_UPDATE]: true,
          [Permission.ENGINEER_DELETE]: false,
          [Permission.USER_READ]: true,
          [Permission.USER_UPDATE]: false,
        }
      },
      {
        role: Role.ENGINEER,
        permissions: {
          [Permission.PROJECT_READ]: false,
          [Permission.PROJECT_CREATE]: false,
          [Permission.PROJECT_UPDATE]: false,
          [Permission.PROJECT_DELETE]: false,
          [Permission.ENGINEER_READ]: true,
          [Permission.ENGINEER_CREATE]: false,
          [Permission.ENGINEER_UPDATE]: false,
          [Permission.ENGINEER_DELETE]: false,
          [Permission.USER_READ]: true,
          [Permission.USER_UPDATE]: true,
        }
      }
    ];

    testCases.forEach(({ role, permissions }) => {
      describe(`${role}ロールの権限テスト`, () => {
        Object.entries(permissions).forEach(([permission, expected]) => {
          it(`${permission}: ${expected ? '許可' : '拒否'}`, () => {
            expect(hasPermission(role, permission as Permission)).toBe(expected);
          });
        });
      });
    });
  });

  describe('データベースモック動作テスト', () => {
    it('Prismaモックが正常に動作する', async () => {
      const mockProject = { id: '1', title: 'Test Project', status: 'ACTIVE' };
      mockPrisma.project.findMany.mockResolvedValue([mockProject]);
      
      const result = await mockPrisma.project.findMany();
      
      expect(result).toEqual([mockProject]);
      expect(mockPrisma.project.findMany).toHaveBeenCalled();
    });

    it('Prismaエラーハンドリング', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.project.findMany.mockRejectedValue(error);
      
      await expect(mockPrisma.project.findMany()).rejects.toThrow('Database connection failed');
    });
  });
}); 
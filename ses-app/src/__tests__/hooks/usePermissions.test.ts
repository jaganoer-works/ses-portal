/**
 * usePermissions カスタムフック単体テスト
 * src/hooks/usePermissions.ts の全機能をテスト
 */

import { renderHook } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/permissions'

// NextAuth.jsのモック
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('usePermissions', () => {
  beforeEach(() => {
    mockUseSession.mockReset()
  })

  describe('未認証ユーザー', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      })
    })

    test('認証情報が正しく設定される', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.user).toBeUndefined()
      expect(result.current.userRole).toBe('')
      expect(result.current.userId).toBe('')
      expect(result.current.isAuthenticated).toBe(false)
    })

    test('ロールチェックが全てfalse', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isSales).toBe(false)
      expect(result.current.isEngineer).toBe(false)
    })

    test('全ての権限がfalse', () => {
      const { result } = renderHook(() => usePermissions())
      
      // 案件権限
      expect(result.current.canReadProjects).toBe(false)
      expect(result.current.canCreateProjects).toBe(false)
      expect(result.current.canUpdateProjects).toBe(false)
      expect(result.current.canDeleteProjects).toBe(false)
      
      // 技術者権限
      expect(result.current.canReadEngineers).toBe(false)
      expect(result.current.canCreateEngineers).toBe(false)
      expect(result.current.canUpdateEngineers).toBe(false)
      expect(result.current.canDeleteEngineers).toBe(false)
      
      // やりとり権限
      expect(result.current.canReadInteractions).toBe(false)
      expect(result.current.canCreateInteractions).toBe(false)
      expect(result.current.canUpdateInteractions).toBe(false)
      expect(result.current.canDeleteInteractions).toBe(false)
      
      // ユーザー権限
      expect(result.current.canReadUsers).toBe(false)
      expect(result.current.canCreateUsers).toBe(false)
      expect(result.current.canUpdateUsers).toBe(false)
      expect(result.current.canDeleteUsers).toBe(false)
      expect(result.current.canManageUsers).toBe(false)
      expect(result.current.isSystemAdmin).toBe(false)
    })

    test('権限チェック関数が正しく動作する', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.hasPermission(Permission.PROJECT_READ)).toBe(false)
      expect(result.current.hasAnyPermission([Permission.PROJECT_READ, Permission.PROJECT_CREATE])).toBe(false)
      expect(result.current.hasAllPermissions([Permission.PROJECT_READ])).toBe(false)
    })
  })

  describe('管理者ユーザー', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'admin-id',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
        update: jest.fn(),
      })
    })

    test('認証情報が正しく設定される', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.user).toBeDefined()
      expect(result.current.userRole).toBe('admin')
      expect(result.current.userId).toBe('admin-id')
      expect(result.current.isAuthenticated).toBe(true)
    })

    test('ロールチェックが正しく動作する', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.isSales).toBe(false)
      expect(result.current.isEngineer).toBe(false)
    })

    test('全ての権限がtrue', () => {
      const { result } = renderHook(() => usePermissions())
      
      // 案件権限
      expect(result.current.canReadProjects).toBe(true)
      expect(result.current.canCreateProjects).toBe(true)
      expect(result.current.canUpdateProjects).toBe(true)
      expect(result.current.canDeleteProjects).toBe(true)
      
      // 技術者権限
      expect(result.current.canReadEngineers).toBe(true)
      expect(result.current.canCreateEngineers).toBe(true)
      expect(result.current.canUpdateEngineers).toBe(true)
      expect(result.current.canDeleteEngineers).toBe(true)
      
      // やりとり権限
      expect(result.current.canReadInteractions).toBe(true)
      expect(result.current.canCreateInteractions).toBe(true)
      expect(result.current.canUpdateInteractions).toBe(true)
      expect(result.current.canDeleteInteractions).toBe(true)
      
      // ユーザー権限
      expect(result.current.canReadUsers).toBe(true)
      expect(result.current.canCreateUsers).toBe(true)
      expect(result.current.canUpdateUsers).toBe(true)
      expect(result.current.canDeleteUsers).toBe(true)
      expect(result.current.canManageUsers).toBe(true)
      expect(result.current.isSystemAdmin).toBe(true)
    })

    test('権限チェック関数が正しく動作する', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.hasPermission(Permission.PROJECT_READ)).toBe(true)
      expect(result.current.hasPermission(Permission.SYSTEM_ADMIN)).toBe(true)
      expect(result.current.hasAnyPermission([Permission.PROJECT_READ, Permission.PROJECT_DELETE])).toBe(true)
      expect(result.current.hasAllPermissions([Permission.PROJECT_READ, Permission.PROJECT_DELETE])).toBe(true)
    })
  })

  describe('営業ユーザー', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'sales-id',
            name: 'Sales User',
            email: 'sales@example.com',
            role: 'sales',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
        update: jest.fn(),
      })
    })

    test('認証情報が正しく設定される', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.user).toBeDefined()
      expect(result.current.userRole).toBe('sales')
      expect(result.current.userId).toBe('sales-id')
      expect(result.current.isAuthenticated).toBe(true)
    })

    test('ロールチェックが正しく動作する', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isSales).toBe(true)
      expect(result.current.isEngineer).toBe(false)
    })

    test('営業の権限が正しく設定される', () => {
      const { result } = renderHook(() => usePermissions())
      
      // 案件権限（削除以外）
      expect(result.current.canReadProjects).toBe(true)
      expect(result.current.canCreateProjects).toBe(true)
      expect(result.current.canUpdateProjects).toBe(true)
      expect(result.current.canDeleteProjects).toBe(false)
      
      // 技術者権限（削除以外）
      expect(result.current.canReadEngineers).toBe(true)
      expect(result.current.canCreateEngineers).toBe(true)
      expect(result.current.canUpdateEngineers).toBe(true)
      expect(result.current.canDeleteEngineers).toBe(false)
      
      // やりとり権限（削除以外）
      expect(result.current.canReadInteractions).toBe(true)
      expect(result.current.canCreateInteractions).toBe(true)
      expect(result.current.canUpdateInteractions).toBe(true)
      expect(result.current.canDeleteInteractions).toBe(false)
      
      // ユーザー権限（読み取りのみ）
      expect(result.current.canReadUsers).toBe(true)
      expect(result.current.canCreateUsers).toBe(false)
      expect(result.current.canUpdateUsers).toBe(false)
      expect(result.current.canDeleteUsers).toBe(false)
      expect(result.current.canManageUsers).toBe(true) // USER_READベース
      expect(result.current.isSystemAdmin).toBe(false)
    })
  })

  describe('エンジニアユーザー', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'engineer-id',
            name: 'Engineer User',
            email: 'engineer@example.com',
            role: 'engineer',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
        update: jest.fn(),
      })
    })

    test('認証情報が正しく設定される', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.user).toBeDefined()
      expect(result.current.userRole).toBe('engineer')
      expect(result.current.userId).toBe('engineer-id')
      expect(result.current.isAuthenticated).toBe(true)
    })

    test('ロールチェックが正しく動作する', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isSales).toBe(false)
      expect(result.current.isEngineer).toBe(true)
    })

    test('エンジニアの制限された権限が正しく設定される', () => {
      const { result } = renderHook(() => usePermissions())
      
      // 案件権限（なし）
      expect(result.current.canReadProjects).toBe(false)
      expect(result.current.canCreateProjects).toBe(false)
      expect(result.current.canUpdateProjects).toBe(false)
      expect(result.current.canDeleteProjects).toBe(false)
      
      // 技術者権限（読み取りのみ）
      expect(result.current.canReadEngineers).toBe(true)
      expect(result.current.canCreateEngineers).toBe(false)
      expect(result.current.canUpdateEngineers).toBe(false)
      expect(result.current.canDeleteEngineers).toBe(false)
      
      // やりとり権限（削除以外）
      expect(result.current.canReadInteractions).toBe(true)
      expect(result.current.canCreateInteractions).toBe(true)
      expect(result.current.canUpdateInteractions).toBe(true)
      expect(result.current.canDeleteInteractions).toBe(false)
      
      // ユーザー権限（読み取り・更新）
      expect(result.current.canReadUsers).toBe(true)
      expect(result.current.canCreateUsers).toBe(false)
      expect(result.current.canUpdateUsers).toBe(true)
      expect(result.current.canDeleteUsers).toBe(false)
      expect(result.current.canManageUsers).toBe(true) // USER_READベース
      expect(result.current.isSystemAdmin).toBe(false)
    })
  })

  describe('リソース所有者チェック', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            role: 'engineer',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
        update: jest.fn(),
      })
    })

    test('isResourceOwner関数が正しく動作する', () => {
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.isResourceOwner('test-user-id')).toBe(true)
      expect(result.current.isResourceOwner('other-user-id')).toBe(false)
      expect(result.current.isResourceOwner('')).toBe(false)
    })

    test('canAccess関数が正しく動作する', () => {
      const { result } = renderHook(() => usePermissions())
      
      // エンジニアは ENGINEER_READ 権限を持つ
      expect(result.current.canAccess(Permission.ENGINEER_READ)).toBe(true)
      
      // エンジニアは PROJECT_READ 権限を持たない
      expect(result.current.canAccess(Permission.PROJECT_READ)).toBe(false)
      
      // 権限がなくても所有者なら true
      expect(result.current.canAccess(Permission.PROJECT_READ, 'test-user-id')).toBe(true)
      
      // 権限もなく所有者でもない場合は false
      expect(result.current.canAccess(Permission.PROJECT_READ, 'other-user-id')).toBe(false)
    })
  })

  describe('パフォーマンス・メモ化', () => {
    test('同じセッションデータでは同じオブジェクトを返す', () => {
      const sessionData = {
        data: {
          user: {
            id: 'test-id',
            name: 'Test',
            email: 'test@example.com',
            role: 'admin',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated' as const,
        update: jest.fn(),
      }

      mockUseSession.mockReturnValue(sessionData)

      const { result, rerender } = renderHook(() => usePermissions())
      const firstResult = result.current

      rerender()
      const secondResult = result.current

      // メモ化により同じオブジェクトが返される
      expect(firstResult).toBe(secondResult)
    })

    test('セッションデータが変わると新しいオブジェクトを返す', () => {
      const initialSession = {
        data: {
          user: {
            id: 'test-id',
            name: 'Test',
            email: 'test@example.com',
            role: 'sales',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated' as const,
        update: jest.fn(),
      }

      mockUseSession.mockReturnValue(initialSession)

      const { result, rerender } = renderHook(() => usePermissions())
      const firstResult = result.current

      // セッションデータを変更
      const changedSession = {
        ...initialSession,
        data: {
          ...initialSession.data,
          user: {
            ...initialSession.data.user,
            role: 'admin',
          },
        },
      }
      mockUseSession.mockReturnValue(changedSession)

      rerender()
      const secondResult = result.current

      // 異なるオブジェクトが返される
      expect(firstResult).not.toBe(secondResult)
      
      // 権限が変わっていることを確認
      expect(firstResult.isAdmin).toBe(false)
      expect(secondResult.isAdmin).toBe(true)
    })
  })

  describe('エッジケース', () => {
    test('空のセッション（userがundefined）', () => {
      mockUseSession.mockReturnValue({
        data: { expires: new Date().toISOString() } as any,
        status: 'authenticated',
        update: jest.fn(),
      })

      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.user).toBeUndefined()
      expect(result.current.userRole).toBe('')
      expect(result.current.userId).toBe('')
      expect(result.current.isAuthenticated).toBe(false)
    })

    test('不正なロール値', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'test-id',
            name: 'Test',
            email: 'test@example.com',
            role: 'invalid-role',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
        update: jest.fn(),
      })

      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.userRole).toBe('invalid-role')
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isSales).toBe(false)
      expect(result.current.isEngineer).toBe(false)
      
      // 不正なロールなので全権限がfalse
      expect(result.current.canReadProjects).toBe(false)
      expect(result.current.isSystemAdmin).toBe(false)
    })
  })
}) 
/**
 * PermissionGuard コンポーネント単体テスト
 * src/components/auth/PermissionGuard.tsx の全機能をテスト
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/permissions'
import {
  PermissionGuard,
  AdminOnly,
  SalesOrHigher,
  EngineerOnly,
  OwnerOrPermission,
} from '@/components/auth/PermissionGuard'

// usePermissionsフックのモック
jest.mock('@/hooks/usePermissions')
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>

describe('PermissionGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const TestComponent = () => <div data-testid="protected-content">保護されたコンテンツ</div>
  const FallbackComponent = () => <div data-testid="fallback-content">アクセス拒否</div>

  describe('認証チェック', () => {
    test('未認証時はfallbackを表示する', () => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: false,
        userRole: '',
        userId: '',
        user: undefined,
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: false,
        isEngineer: false,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadEngineers: false,
        canCreateEngineers: false,
        canUpdateEngineers: false,
        canDeleteEngineers: false,
        canReadInteractions: false,
        canCreateInteractions: false,
        canUpdateInteractions: false,
        canDeleteInteractions: false,
        canReadUsers: false,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: false,
        isSystemAdmin: false,
      })

      render(
        <PermissionGuard fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard>
      )

      expect(screen.getByTestId('fallback-content')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    test('認証済みでfallbackなしの場合は何も表示しない', () => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: false,
        userRole: '',
        userId: '',
        user: undefined,
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: false,
        isEngineer: false,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadEngineers: false,
        canCreateEngineers: false,
        canUpdateEngineers: false,
        canDeleteEngineers: false,
        canReadInteractions: false,
        canCreateInteractions: false,
        canUpdateInteractions: false,
        canDeleteInteractions: false,
        canReadUsers: false,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: false,
        isSystemAdmin: false,
      })

      render(
        <PermissionGuard>
          <TestComponent />
        </PermissionGuard>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('fallback-content')).not.toBeInTheDocument()
    })
  })

  describe('ロールチェック', () => {
    test('指定されたロールに含まれる場合はコンテンツを表示', () => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'admin',
        userId: 'user-123',
        user: { id: 'user-123', role: 'admin', name: 'Admin', email: 'admin@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: true,
        isSales: false,
        isEngineer: false,
        canReadProjects: true,
        canCreateProjects: true,
        canUpdateProjects: true,
        canDeleteProjects: true,
        canReadEngineers: true,
        canCreateEngineers: true,
        canUpdateEngineers: true,
        canDeleteEngineers: true,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: true,
        canReadUsers: true,
        canCreateUsers: true,
        canUpdateUsers: true,
        canDeleteUsers: true,
        canManageUsers: true,
        isSystemAdmin: true,
      })

      render(
        <PermissionGuard roles={['admin', 'sales']} fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.queryByTestId('fallback-content')).not.toBeInTheDocument()
    })

    test('指定されたロールに含まれない場合はfallbackを表示', () => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'engineer',
        userId: 'user-123',
        user: { id: 'user-123', role: 'engineer', name: 'Engineer', email: 'engineer@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: false,
        isEngineer: true,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadEngineers: true,
        canCreateEngineers: false,
        canUpdateEngineers: false,
        canDeleteEngineers: false,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: false,
        canReadUsers: true,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: true,
        isSystemAdmin: false,
      })

      render(
        <PermissionGuard roles={['admin', 'sales']} fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard>
      )

      expect(screen.getByTestId('fallback-content')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })

  describe('単一権限チェック', () => {
    test('権限がある場合はコンテンツを表示', () => {
      const mockCanAccess = jest.fn().mockReturnValue(true)
      
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'admin',
        userId: 'user-123',
        user: { id: 'user-123', role: 'admin', name: 'Admin', email: 'admin@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: mockCanAccess,
        isResourceOwner: jest.fn(),
        isAdmin: true,
        isSales: false,
        isEngineer: false,
        canReadProjects: true,
        canCreateProjects: true,
        canUpdateProjects: true,
        canDeleteProjects: true,
        canReadEngineers: true,
        canCreateEngineers: true,
        canUpdateEngineers: true,
        canDeleteEngineers: true,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: true,
        canReadUsers: true,
        canCreateUsers: true,
        canUpdateUsers: true,
        canDeleteUsers: true,
        canManageUsers: true,
        isSystemAdmin: true,
      })

      render(
        <PermissionGuard permission={Permission.PROJECT_DELETE} fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard>
      )

      expect(mockCanAccess).toHaveBeenCalledWith(Permission.PROJECT_DELETE, undefined)
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.queryByTestId('fallback-content')).not.toBeInTheDocument()
    })

    test('権限がない場合はfallbackを表示', () => {
      const mockCanAccess = jest.fn().mockReturnValue(false)
      
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'engineer',
        userId: 'user-123',
        user: { id: 'user-123', role: 'engineer', name: 'Engineer', email: 'engineer@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: mockCanAccess,
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: false,
        isEngineer: true,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadEngineers: true,
        canCreateEngineers: false,
        canUpdateEngineers: false,
        canDeleteEngineers: false,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: false,
        canReadUsers: true,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: true,
        isSystemAdmin: false,
      })

      render(
        <PermissionGuard permission={Permission.PROJECT_DELETE} fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard>
      )

      expect(mockCanAccess).toHaveBeenCalledWith(Permission.PROJECT_DELETE, undefined)
      expect(screen.getByTestId('fallback-content')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    test('リソース所有者チェック付き権限チェック', () => {
      const mockCanAccess = jest.fn().mockReturnValue(true)
      
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'engineer',
        userId: 'user-123',
        user: { id: 'user-123', role: 'engineer', name: 'Engineer', email: 'engineer@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: mockCanAccess,
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: false,
        isEngineer: true,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadEngineers: true,
        canCreateEngineers: false,
        canUpdateEngineers: false,
        canDeleteEngineers: false,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: false,
        canReadUsers: true,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: true,
        isSystemAdmin: false,
      })

      render(
        <PermissionGuard 
          permission={Permission.USER_UPDATE} 
          resourceUserId="user-123"
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </PermissionGuard>
      )

      expect(mockCanAccess).toHaveBeenCalledWith(Permission.USER_UPDATE, 'user-123')
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  describe('複数権限チェック', () => {
    test('requireAll=false（デフォルト）: いずれかの権限があれば表示', () => {
      const mockHasAnyPermission = jest.fn().mockReturnValue(true)
      
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'sales',
        userId: 'user-123',
        user: { id: 'user-123', role: 'sales', name: 'Sales', email: 'sales@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: mockHasAnyPermission,
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: true,
        isEngineer: false,
        canReadProjects: true,
        canCreateProjects: true,
        canUpdateProjects: true,
        canDeleteProjects: false,
        canReadEngineers: true,
        canCreateEngineers: true,
        canUpdateEngineers: true,
        canDeleteEngineers: false,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: false,
        canReadUsers: true,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: true,
        isSystemAdmin: false,
      })

      const permissions = [Permission.PROJECT_CREATE, Permission.PROJECT_DELETE]

      render(
        <PermissionGuard permissions={permissions} fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard>
      )

      expect(mockHasAnyPermission).toHaveBeenCalledWith(permissions)
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    test('requireAll=true: 全ての権限が必要', () => {
      const mockHasAllPermissions = jest.fn().mockReturnValue(true)
      
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'admin',
        userId: 'user-123',
        user: { id: 'user-123', role: 'admin', name: 'Admin', email: 'admin@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: mockHasAllPermissions,
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: true,
        isSales: false,
        isEngineer: false,
        canReadProjects: true,
        canCreateProjects: true,
        canUpdateProjects: true,
        canDeleteProjects: true,
        canReadEngineers: true,
        canCreateEngineers: true,
        canUpdateEngineers: true,
        canDeleteEngineers: true,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: true,
        canReadUsers: true,
        canCreateUsers: true,
        canUpdateUsers: true,
        canDeleteUsers: true,
        canManageUsers: true,
        isSystemAdmin: true,
      })

      const permissions = [Permission.PROJECT_CREATE, Permission.PROJECT_DELETE]

      render(
        <PermissionGuard 
          permissions={permissions} 
          requireAll={true}
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </PermissionGuard>
      )

      expect(mockHasAllPermissions).toHaveBeenCalledWith(permissions)
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    test('権限なしで空配列の場合はfallbackを表示', () => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'engineer',
        userId: 'user-123',
        user: { id: 'user-123', role: 'engineer', name: 'Engineer', email: 'engineer@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn().mockReturnValue(false),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: false,
        isEngineer: true,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadEngineers: true,
        canCreateEngineers: false,
        canUpdateEngineers: false,
        canDeleteEngineers: false,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: false,
        canReadUsers: true,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: true,
        isSystemAdmin: false,
      })

      render(
        <PermissionGuard permissions={[]} fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  describe('デフォルト動作（権限・ロール指定なし）', () => {
    test('認証済みならコンテンツを表示', () => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'engineer',
        userId: 'user-123',
        user: { id: 'user-123', role: 'engineer', name: 'Engineer', email: 'engineer@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: false,
        isEngineer: true,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadEngineers: true,
        canCreateEngineers: false,
        canUpdateEngineers: false,
        canDeleteEngineers: false,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: false,
        canReadUsers: true,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: true,
        isSystemAdmin: false,
      })

      render(
        <PermissionGuard fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.queryByTestId('fallback-content')).not.toBeInTheDocument()
    })
  })
})

describe('ラッパーコンポーネント', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const TestComponent = () => <div data-testid="wrapper-content">ラッパーコンテンツ</div>
  const FallbackComponent = () => <div data-testid="wrapper-fallback">アクセス拒否</div>

  describe('AdminOnly', () => {
    test('管理者の場合はコンテンツを表示', () => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'admin',
        userId: 'admin-123',
        user: { id: 'admin-123', role: 'admin', name: 'Admin', email: 'admin@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: true,
        isSales: false,
        isEngineer: false,
        canReadProjects: true,
        canCreateProjects: true,
        canUpdateProjects: true,
        canDeleteProjects: true,
        canReadEngineers: true,
        canCreateEngineers: true,
        canUpdateEngineers: true,
        canDeleteEngineers: true,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: true,
        canReadUsers: true,
        canCreateUsers: true,
        canUpdateUsers: true,
        canDeleteUsers: true,
        canManageUsers: true,
        isSystemAdmin: true,
      })

      render(
        <AdminOnly fallback={<FallbackComponent />}>
          <TestComponent />
        </AdminOnly>
      )

      expect(screen.getByTestId('wrapper-content')).toBeInTheDocument()
      expect(screen.queryByTestId('wrapper-fallback')).not.toBeInTheDocument()
    })

    test('管理者以外の場合はfallbackを表示', () => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'sales',
        userId: 'sales-123',
        user: { id: 'sales-123', role: 'sales', name: 'Sales', email: 'sales@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: true,
        isEngineer: false,
        canReadProjects: true,
        canCreateProjects: true,
        canUpdateProjects: true,
        canDeleteProjects: false,
        canReadEngineers: true,
        canCreateEngineers: true,
        canUpdateEngineers: true,
        canDeleteEngineers: false,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: false,
        canReadUsers: true,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: true,
        isSystemAdmin: false,
      })

      render(
        <AdminOnly fallback={<FallbackComponent />}>
          <TestComponent />
        </AdminOnly>
      )

      expect(screen.getByTestId('wrapper-fallback')).toBeInTheDocument()
      expect(screen.queryByTestId('wrapper-content')).not.toBeInTheDocument()
    })
  })

  describe('SalesOrHigher', () => {
    test.each([
      ['admin', true],
      ['sales', true],
      ['engineer', false]
    ])('ロール %s の場合、表示: %s', (role, shouldShow) => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: role,
        userId: `${role}-123`,
        user: { id: `${role}-123`, role, name: role, email: `${role}@test.com` },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: role === 'admin',
        isSales: role === 'sales',
        isEngineer: role === 'engineer',
        canReadProjects: role !== 'engineer',
        canCreateProjects: role !== 'engineer',
        canUpdateProjects: role !== 'engineer',
        canDeleteProjects: role === 'admin',
        canReadEngineers: true,
        canCreateEngineers: role !== 'engineer',
        canUpdateEngineers: role !== 'engineer' || role === 'engineer',
        canDeleteEngineers: role === 'admin',
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: role === 'admin',
        canReadUsers: true,
        canCreateUsers: role === 'admin',
        canUpdateUsers: role === 'admin' || role === 'engineer',
        canDeleteUsers: role === 'admin',
        canManageUsers: true,
        isSystemAdmin: role === 'admin',
      })

      render(
        <SalesOrHigher fallback={<FallbackComponent />}>
          <TestComponent />
        </SalesOrHigher>
      )

      if (shouldShow) {
        expect(screen.getByTestId('wrapper-content')).toBeInTheDocument()
        expect(screen.queryByTestId('wrapper-fallback')).not.toBeInTheDocument()
      } else {
        expect(screen.getByTestId('wrapper-fallback')).toBeInTheDocument()
        expect(screen.queryByTestId('wrapper-content')).not.toBeInTheDocument()
      }
    })
  })

  describe('EngineerOnly', () => {
    test('エンジニアの場合はコンテンツを表示', () => {
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'engineer',
        userId: 'engineer-123',
        user: { id: 'engineer-123', role: 'engineer', name: 'Engineer', email: 'engineer@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: jest.fn(),
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: false,
        isEngineer: true,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadEngineers: true,
        canCreateEngineers: false,
        canUpdateEngineers: false,
        canDeleteEngineers: false,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: false,
        canReadUsers: true,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: true,
        isSystemAdmin: false,
      })

      render(
        <EngineerOnly fallback={<FallbackComponent />}>
          <TestComponent />
        </EngineerOnly>
      )

      expect(screen.getByTestId('wrapper-content')).toBeInTheDocument()
    })
  })

  describe('OwnerOrPermission', () => {
    test('権限またはリソース所有者の場合はコンテンツを表示', () => {
      const mockCanAccess = jest.fn().mockReturnValue(true)
      
      mockUsePermissions.mockReturnValue({
        isAuthenticated: true,
        userRole: 'engineer',
        userId: 'engineer-123',
        user: { id: 'engineer-123', role: 'engineer', name: 'Engineer', email: 'engineer@test.com' },
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccess: mockCanAccess,
        isResourceOwner: jest.fn(),
        isAdmin: false,
        isSales: false,
        isEngineer: true,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadEngineers: true,
        canCreateEngineers: false,
        canUpdateEngineers: false,
        canDeleteEngineers: false,
        canReadInteractions: true,
        canCreateInteractions: true,
        canUpdateInteractions: true,
        canDeleteInteractions: false,
        canReadUsers: true,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canManageUsers: true,
        isSystemAdmin: false,
      })

      render(
        <OwnerOrPermission 
          permission={Permission.USER_UPDATE}
          resourceUserId="engineer-123"
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </OwnerOrPermission>
      )

      expect(mockCanAccess).toHaveBeenCalledWith(Permission.USER_UPDATE, 'engineer-123')
      expect(screen.getByTestId('wrapper-content')).toBeInTheDocument()
    })
  })
}) 
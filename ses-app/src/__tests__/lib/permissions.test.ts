/**
 * 権限システム単体テスト
 * src/lib/permissions.ts の全機能をテスト
 */

import {
  Role,
  Permission,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isResourceOwner,
  PermissionError,
} from '@/lib/permissions'

describe('権限システム', () => {
  describe('Role enum', () => {
    test('全ロールが正しく定義されている', () => {
      expect(Role.ADMIN).toBe('admin')
      expect(Role.SALES).toBe('sales')
      expect(Role.ENGINEER).toBe('engineer')
    })
  })

  describe('Permission enum', () => {
    test('案件権限が正しく定義されている', () => {
      expect(Permission.PROJECT_READ).toBe('project:read')
      expect(Permission.PROJECT_CREATE).toBe('project:create')
      expect(Permission.PROJECT_UPDATE).toBe('project:update')
      expect(Permission.PROJECT_DELETE).toBe('project:delete')
    })

    test('技術者権限が正しく定義されている', () => {
      expect(Permission.ENGINEER_READ).toBe('engineer:read')
      expect(Permission.ENGINEER_CREATE).toBe('engineer:create')
      expect(Permission.ENGINEER_UPDATE).toBe('engineer:update')
      expect(Permission.ENGINEER_DELETE).toBe('engineer:delete')
    })

    test('やりとり権限が正しく定義されている', () => {
      expect(Permission.INTERACTION_READ).toBe('interaction:read')
      expect(Permission.INTERACTION_CREATE).toBe('interaction:create')
      expect(Permission.INTERACTION_UPDATE).toBe('interaction:update')
      expect(Permission.INTERACTION_DELETE).toBe('interaction:delete')
    })

    test('ユーザー管理権限が正しく定義されている', () => {
      expect(Permission.USER_READ).toBe('user:read')
      expect(Permission.USER_CREATE).toBe('user:create')
      expect(Permission.USER_UPDATE).toBe('user:update')
      expect(Permission.USER_DELETE).toBe('user:delete')
    })

    test('システム管理権限が正しく定義されている', () => {
      expect(Permission.SYSTEM_ADMIN).toBe('system:admin')
    })
  })

  describe('ROLE_PERMISSIONS権限マトリックス', () => {
    test('管理者は全ての権限を持つ', () => {
      const adminPermissions = ROLE_PERMISSIONS[Role.ADMIN]
      
      // 全権限が含まれていることを確認
      expect(adminPermissions).toContain(Permission.PROJECT_READ)
      expect(adminPermissions).toContain(Permission.PROJECT_DELETE)
      expect(adminPermissions).toContain(Permission.ENGINEER_DELETE)
      expect(adminPermissions).toContain(Permission.USER_DELETE)
      expect(adminPermissions).toContain(Permission.SYSTEM_ADMIN)
      
      // 全17権限が含まれていることを確認
      expect(adminPermissions).toHaveLength(17)
    })

    test('営業は適切な権限のみを持つ', () => {
      const salesPermissions = ROLE_PERMISSIONS[Role.SALES]
      
      // 持っている権限
      expect(salesPermissions).toContain(Permission.PROJECT_READ)
      expect(salesPermissions).toContain(Permission.PROJECT_CREATE)
      expect(salesPermissions).toContain(Permission.PROJECT_UPDATE)
      expect(salesPermissions).toContain(Permission.ENGINEER_READ)
      expect(salesPermissions).toContain(Permission.ENGINEER_CREATE)
      expect(salesPermissions).toContain(Permission.ENGINEER_UPDATE)
      expect(salesPermissions).toContain(Permission.USER_READ)
      
      // 持っていない権限
      expect(salesPermissions).not.toContain(Permission.PROJECT_DELETE)
      expect(salesPermissions).not.toContain(Permission.ENGINEER_DELETE)
      expect(salesPermissions).not.toContain(Permission.USER_DELETE)
      expect(salesPermissions).not.toContain(Permission.SYSTEM_ADMIN)
      
      // 権限数の確認
      expect(salesPermissions).toHaveLength(10)
    })

    test('エンジニアは制限された権限のみを持つ', () => {
      const engineerPermissions = ROLE_PERMISSIONS[Role.ENGINEER]
      
      // 持っている権限
      expect(engineerPermissions).toContain(Permission.ENGINEER_READ)
      expect(engineerPermissions).toContain(Permission.INTERACTION_READ)
      expect(engineerPermissions).toContain(Permission.INTERACTION_CREATE)
      expect(engineerPermissions).toContain(Permission.INTERACTION_UPDATE)
      expect(engineerPermissions).toContain(Permission.USER_READ)
      expect(engineerPermissions).toContain(Permission.USER_UPDATE)
      
      // 持っていない権限
      expect(engineerPermissions).not.toContain(Permission.PROJECT_CREATE)
      expect(engineerPermissions).not.toContain(Permission.PROJECT_DELETE)
      expect(engineerPermissions).not.toContain(Permission.ENGINEER_CREATE)
      expect(engineerPermissions).not.toContain(Permission.ENGINEER_DELETE)
      expect(engineerPermissions).not.toContain(Permission.SYSTEM_ADMIN)
      
      // 権限数の確認
      expect(engineerPermissions).toHaveLength(6)
    })
  })

  describe('hasPermission関数', () => {
    test('管理者は全ての権限を持つ', () => {
      expect(hasPermission(Role.ADMIN, Permission.PROJECT_READ)).toBe(true)
      expect(hasPermission(Role.ADMIN, Permission.PROJECT_DELETE)).toBe(true)
      expect(hasPermission(Role.ADMIN, Permission.ENGINEER_DELETE)).toBe(true)
      expect(hasPermission(Role.ADMIN, Permission.SYSTEM_ADMIN)).toBe(true)
    })

    test('営業は適切な権限のみを持つ', () => {
      expect(hasPermission(Role.SALES, Permission.PROJECT_READ)).toBe(true)
      expect(hasPermission(Role.SALES, Permission.PROJECT_CREATE)).toBe(true)
      expect(hasPermission(Role.SALES, Permission.PROJECT_DELETE)).toBe(false)
      expect(hasPermission(Role.SALES, Permission.ENGINEER_DELETE)).toBe(false)
      expect(hasPermission(Role.SALES, Permission.SYSTEM_ADMIN)).toBe(false)
    })

    test('エンジニアは制限された権限のみを持つ', () => {
      expect(hasPermission(Role.ENGINEER, Permission.ENGINEER_READ)).toBe(true)
      expect(hasPermission(Role.ENGINEER, Permission.USER_UPDATE)).toBe(true)
      expect(hasPermission(Role.ENGINEER, Permission.PROJECT_CREATE)).toBe(false)
      expect(hasPermission(Role.ENGINEER, Permission.ENGINEER_DELETE)).toBe(false)
      expect(hasPermission(Role.ENGINEER, Permission.SYSTEM_ADMIN)).toBe(false)
    })

    test('存在しないロールはfalseを返す', () => {
      expect(hasPermission('invalid_role', Permission.PROJECT_READ)).toBe(false)
      expect(hasPermission('', Permission.PROJECT_READ)).toBe(false)
    })

    test('空文字・null・undefinedでもfalseを返す', () => {
      expect(hasPermission('', Permission.PROJECT_READ)).toBe(false)
      // TypeScriptでは以下はコンパイルエラーになるが、実行時の安全性をテスト
      expect(hasPermission(null as any, Permission.PROJECT_READ)).toBe(false)
      expect(hasPermission(undefined as any, Permission.PROJECT_READ)).toBe(false)
    })
  })

  describe('hasAnyPermission関数', () => {
    test('管理者：いずれかの権限を持つ場合はtrue', () => {
      expect(hasAnyPermission(Role.ADMIN, [
        Permission.PROJECT_READ,
        Permission.SYSTEM_ADMIN
      ])).toBe(true)
    })

    test('営業：一部権限を持つ場合はtrue', () => {
      expect(hasAnyPermission(Role.SALES, [
        Permission.PROJECT_READ,
        Permission.ENGINEER_DELETE // 持たない権限
      ])).toBe(true)
    })

    test('エンジニア：権限を持たない場合はfalse', () => {
      expect(hasAnyPermission(Role.ENGINEER, [
        Permission.PROJECT_DELETE,
        Permission.ENGINEER_DELETE,
        Permission.SYSTEM_ADMIN
      ])).toBe(false)
    })

    test('空配列の場合はfalse', () => {
      expect(hasAnyPermission(Role.ADMIN, [])).toBe(false)
    })

    test('存在しないロールはfalse', () => {
      expect(hasAnyPermission('invalid_role', [Permission.PROJECT_READ])).toBe(false)
    })
  })

  describe('hasAllPermissions関数', () => {
    test('管理者：全ての権限を持つ場合はtrue', () => {
      expect(hasAllPermissions(Role.ADMIN, [
        Permission.PROJECT_READ,
        Permission.PROJECT_DELETE,
        Permission.SYSTEM_ADMIN
      ])).toBe(true)
    })

    test('営業：一部権限を持たない場合はfalse', () => {
      expect(hasAllPermissions(Role.SALES, [
        Permission.PROJECT_READ,
        Permission.PROJECT_DELETE // 持たない権限
      ])).toBe(false)
    })

    test('エンジニア：持つ権限のみの場合はtrue', () => {
      expect(hasAllPermissions(Role.ENGINEER, [
        Permission.ENGINEER_READ,
        Permission.USER_READ
      ])).toBe(true)
    })

    test('空配列の場合はtrue', () => {
      expect(hasAllPermissions(Role.ADMIN, [])).toBe(true)
    })

    test('存在しないロールで空配列以外はfalse', () => {
      expect(hasAllPermissions('invalid_role', [Permission.PROJECT_READ])).toBe(false)
      expect(hasAllPermissions('invalid_role', [])).toBe(true) // 空配列は常にtrue
    })
  })

  describe('isResourceOwner関数', () => {
    test('同じユーザーIDの場合はtrue', () => {
      expect(isResourceOwner('user123', 'user123')).toBe(true)
    })

    test('異なるユーザーIDの場合はfalse', () => {
      expect(isResourceOwner('user123', 'user456')).toBe(false)
    })

    test('空文字同士の場合はtrue', () => {
      expect(isResourceOwner('', '')).toBe(true)
    })

    test('null・undefinedの組み合わせ', () => {
      expect(isResourceOwner('user123', '')).toBe(false)
      expect(isResourceOwner('', 'user123')).toBe(false)
      // TypeScript上はコンパイルエラーだが、実行時安全性をテスト
      expect(isResourceOwner(null as any, null as any)).toBe(true)
      expect(isResourceOwner(undefined as any, undefined as any)).toBe(true)
      expect(isResourceOwner('user123', null as any)).toBe(false)
    })
  })

  describe('PermissionError', () => {
    test('適切なエラーメッセージを生成する', () => {
      const error = new PermissionError(Permission.PROJECT_DELETE, Role.SALES)
      
      expect(error.name).toBe('PermissionError')
      expect(error.message).toBe('権限がありません。必要な権限: project:delete, ユーザーロール: sales')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(PermissionError)
    })

    test('複数の権限・ロール組み合わせで正しいメッセージを生成する', () => {
      const error1 = new PermissionError(Permission.SYSTEM_ADMIN, Role.ENGINEER)
      expect(error1.message).toBe('権限がありません。必要な権限: system:admin, ユーザーロール: engineer')
      
      const error2 = new PermissionError(Permission.USER_DELETE, Role.SALES)
      expect(error2.message).toBe('権限がありません。必要な権限: user:delete, ユーザーロール: sales')
    })
  })

  describe('エッジケース・統合テスト', () => {
    test('全ロールの権限数が期待通り', () => {
      expect(ROLE_PERMISSIONS[Role.ADMIN]).toHaveLength(17)
      expect(ROLE_PERMISSIONS[Role.SALES]).toHaveLength(10)
      expect(ROLE_PERMISSIONS[Role.ENGINEER]).toHaveLength(6)
    })

    test('権限の重複がない', () => {
      Object.values(ROLE_PERMISSIONS).forEach(permissions => {
        const uniquePermissions = [...new Set(permissions)]
        expect(permissions).toHaveLength(uniquePermissions.length)
      })
    })

    test('全てのPermission enumが少なくとも1つのロールに割り当てられている', () => {
      const allPermissions = Object.values(Permission)
      const assignedPermissions = new Set(Object.values(ROLE_PERMISSIONS).flat())
      
      allPermissions.forEach(permission => {
        expect(assignedPermissions).toContain(permission)
      })
    })
  })
}) 
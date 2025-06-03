import { useSession } from "next-auth/react";
import { useMemo, useCallback } from "react";
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions, isResourceOwner } from "@/lib/permissions";

export function usePermissions() {
  const { data: session } = useSession();
  
  const userRole = session?.user?.role || "";
  const userId = session?.user?.id || "";
  const isAuthenticated = !!session?.user;
  
  // 全ての権限計算を単一のuseMemoでまとめて無限ループを防ぐ
  const permissions = useMemo(() => {
    return {
      // 基本的な権限チェック関数
      hasPermission: (permission: Permission) => hasPermission(userRole, permission),
      hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
      hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
      
      // リソース所有者チェック
      isResourceOwner: (resourceUserId: string) => isResourceOwner(userId, resourceUserId),
      
      // 権限チェック + 所有者チェック
      canAccess: (permission: Permission, resourceUserId?: string) => {
        if (hasPermission(userRole, permission)) return true;
        if (resourceUserId && isResourceOwner(userId, resourceUserId)) return true;
        return false;
      },
      
      // 現在のユーザー情報
      user: session?.user,
      userRole,
      userId,
      isAuthenticated,
      
      // ロール別チェック（プリミティブ値）
      isAdmin: userRole === "admin",
      isSales: userRole === "sales", 
      isEngineer: userRole === "engineer",
      
      // 具体的な機能権限チェック（プリミティブ値）
      canReadProjects: hasPermission(userRole, Permission.PROJECT_READ),
      canCreateProjects: hasPermission(userRole, Permission.PROJECT_CREATE),
      canUpdateProjects: hasPermission(userRole, Permission.PROJECT_UPDATE),
      canDeleteProjects: hasPermission(userRole, Permission.PROJECT_DELETE),
      
      canReadEngineers: hasPermission(userRole, Permission.ENGINEER_READ),
      canCreateEngineers: hasPermission(userRole, Permission.ENGINEER_CREATE),
      canUpdateEngineers: hasPermission(userRole, Permission.ENGINEER_UPDATE),
      canDeleteEngineers: hasPermission(userRole, Permission.ENGINEER_DELETE),
      
      canReadInteractions: hasPermission(userRole, Permission.INTERACTION_READ),
      canCreateInteractions: hasPermission(userRole, Permission.INTERACTION_CREATE),
      canUpdateInteractions: hasPermission(userRole, Permission.INTERACTION_UPDATE),
      canDeleteInteractions: hasPermission(userRole, Permission.INTERACTION_DELETE),
      
      canReadUsers: hasPermission(userRole, Permission.USER_READ),
      canCreateUsers: hasPermission(userRole, Permission.USER_CREATE),
      canUpdateUsers: hasPermission(userRole, Permission.USER_UPDATE),
      canDeleteUsers: hasPermission(userRole, Permission.USER_DELETE),
      canManageUsers: hasPermission(userRole, Permission.USER_READ),
      isSystemAdmin: hasPermission(userRole, Permission.SYSTEM_ADMIN),
    };
  }, [userRole, userId, isAuthenticated, session?.user]);
  
  return permissions;
} 
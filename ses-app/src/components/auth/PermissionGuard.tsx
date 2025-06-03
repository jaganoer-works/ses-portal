import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // trueの場合は全ての権限が必要、falseの場合はいずれかの権限があればOK
  resourceUserId?: string; // リソース所有者チェック用
  fallback?: React.ReactNode; // 権限がない場合の表示
  roles?: string[]; // 特定のロールのみ許可
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  resourceUserId,
  fallback = null,
  roles
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    userRole,
    isAuthenticated
  } = usePermissions();

  // 認証チェック
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // ロール制限チェック
  if (roles && !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // 権限チェック
  let hasAccess = false;

  if (permission) {
    // 単一権限チェック（リソース所有者チェック含む）
    hasAccess = canAccess(permission, resourceUserId);
  } else if (permissions && permissions.length > 0) {
    // 複数権限チェック
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else if (roles) {
    // ロールのみの場合は既にチェック済み
    hasAccess = true;
  } else {
    // デフォルトは認証済みならOK
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// 便利なラッパーコンポーネント

// 管理者のみ表示
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard roles={["admin"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

// 営業以上（管理者・営業）のみ表示
export function SalesOrHigher({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard roles={["admin", "sales"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

// エンジニア専用表示
export function EngineerOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard roles={["engineer"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

// リソース所有者または権限保持者のみ表示
export function OwnerOrPermission({ 
  children, 
  permission, 
  resourceUserId, 
  fallback 
}: { 
  children: React.ReactNode; 
  permission: Permission; 
  resourceUserId: string;
  fallback?: React.ReactNode;
}) {
  return (
    <PermissionGuard permission={permission} resourceUserId={resourceUserId} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
} 
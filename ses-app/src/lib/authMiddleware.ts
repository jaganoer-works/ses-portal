import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Permission, hasPermission, PermissionError, isResourceOwner } from "@/lib/permissions";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";

// 認証チェック
export async function requireAuth(req: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    throw new Error("認証が必要です");
  }
  
  return session;
}

// 権限チェック
export function requirePermission(permission: Permission) {
  return async (req: NextRequest) => {
    const session = await requireAuth(req);
    
    if (!hasPermission(session.user.role, permission)) {
      throw new PermissionError(permission, session.user.role);
    }
    
    return session;
  };
}

// 複数権限チェック（いずれかの権限があればOK）
export function requireAnyPermission(permissions: Permission[]) {
  return async (req: NextRequest) => {
    const session = await requireAuth(req);
    
    const hasAnyPerm = permissions.some(permission => 
      hasPermission(session.user.role, permission)
    );
    
    if (!hasAnyPerm) {
      throw new PermissionError(permissions[0], session.user.role);
    }
    
    return session;
  };
}

// リソース所有者またはアクセス権限チェック
export function requireOwnershipOrPermission(permission: Permission, getUserIdFromRequest: (req: NextRequest) => string) {
  return async (req: NextRequest) => {
    const session = await requireAuth(req);
    const resourceUserId = getUserIdFromRequest(req);
    
    // 自分のリソースまたは権限がある場合はOK
    if (isResourceOwner(session.user.id, resourceUserId) || 
        hasPermission(session.user.role, permission)) {
      return session;
    }
    
    throw new PermissionError(permission, session.user.role);
  };
}

// APIハンドラーラッパー（権限チェック付き）
export function withAuth<T extends any[]>(
  handler: (req: NextRequest, session: any, ...args: T) => Promise<NextResponse>,
  authCheck?: (req: NextRequest) => Promise<any>
) {
  return async (req: NextRequest, ...args: T) => {
    try {
      const session = authCheck ? await authCheck(req) : await requireAuth(req);
      return await handler(req, session, ...args);
    } catch (error) {
      if (error instanceof PermissionError) {
        return apiError(error.message, HTTP_STATUS.FORBIDDEN);
      }
      if (error instanceof Error && error.message.includes("認証")) {
        return apiError("認証が必要です", HTTP_STATUS.UNAUTHORIZED);
      }
      console.error("認証ミドルウェアエラー:", error);
      return apiError("内部サーバーエラー", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
} 
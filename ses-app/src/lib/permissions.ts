// ロール定義
export enum Role {
  ADMIN = "admin",
  SALES = "sales", 
  ENGINEER = "engineer"
}

// 権限アクション定義
export enum Permission {
  // 案件権限
  PROJECT_READ = "project:read",
  PROJECT_CREATE = "project:create", 
  PROJECT_UPDATE = "project:update",
  PROJECT_DELETE = "project:delete",
  
  // 技術者権限
  ENGINEER_READ = "engineer:read",
  ENGINEER_CREATE = "engineer:create",
  ENGINEER_UPDATE = "engineer:update", 
  ENGINEER_DELETE = "engineer:delete",
  
  // やりとり権限
  INTERACTION_READ = "interaction:read",
  INTERACTION_CREATE = "interaction:create",
  INTERACTION_UPDATE = "interaction:update",
  INTERACTION_DELETE = "interaction:delete",
  
  // ユーザー管理権限
  USER_READ = "user:read",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",
  
  // システム管理権限
  SYSTEM_ADMIN = "system:admin"
}

// ロール別権限マトリックス
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // 管理者は全ての権限を持つ
    Permission.PROJECT_READ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.ENGINEER_READ,
    Permission.ENGINEER_CREATE,
    Permission.ENGINEER_UPDATE,
    Permission.ENGINEER_DELETE,
    Permission.INTERACTION_READ,
    Permission.INTERACTION_CREATE,
    Permission.INTERACTION_UPDATE,
    Permission.INTERACTION_DELETE,
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.SYSTEM_ADMIN
  ],
  
  [Role.SALES]: [
    // 営業は案件・技術者・やりとりの読み取り・作成・更新権限
    Permission.PROJECT_READ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.ENGINEER_READ,
    Permission.ENGINEER_CREATE,
    Permission.ENGINEER_UPDATE,
    Permission.INTERACTION_READ,
    Permission.INTERACTION_CREATE,
    Permission.INTERACTION_UPDATE,
    Permission.USER_READ
  ],
  
  [Role.ENGINEER]: [
    // エンジニアは自分の情報と関連するやりとりのみ
    Permission.ENGINEER_READ,
    Permission.INTERACTION_READ,
    Permission.INTERACTION_CREATE,
    Permission.INTERACTION_UPDATE,
    Permission.USER_READ,
    Permission.USER_UPDATE
  ]
};

// 権限チェック関数
export function hasPermission(userRole: string, permission: Permission): boolean {
  const role = userRole as Role;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

// 複数権限チェック関数
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// 全権限チェック関数
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// リソース所有者チェック（エンジニアが自分の情報にアクセスする場合など）
export function isResourceOwner(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId;
}

// 権限エラー作成
export class PermissionError extends Error {
  constructor(permission: Permission, userRole: string) {
    super(`権限がありません。必要な権限: ${permission}, ユーザーロール: ${userRole}`);
    this.name = "PermissionError";
  }
} 
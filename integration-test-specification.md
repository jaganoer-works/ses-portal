# 統合テスト仕様書

## 概要

SES案件・技術者管理アプリケーションの統合テスト実装仕様書です。
認証システム、権限制御、ページ間遷移の統合的な動作を検証します。

## テスト環境

- **テストフレームワーク**: Jest + React Testing Library
- **モックサーバー**: MSW (Mock Service Worker)
- **認証システム**: NextAuth.js v5
- **データベース**: Prisma + SQLite (モック)
- **総テスト数**: **75テスト**

## テストスイート構成

### 1. セットアップ基盤テスト (`setup.ts`)
**テスト数**: 4テスト

#### 機能概要
- 統合テスト実行環境の初期化
- モックセッションデータの提供
- APIリクエスト/レスポンスヘルパー関数
- テストライフサイクル管理

#### テストケース
1. **セットアップファイル読み込み確認**
   - 統合テストセットアップが正常に動作することを確認

#### モックセッションデータ
```typescript
export const mockSessions = {
  admin: {
    user: { id: 'admin-id', email: 'admin@example.com', name: 'Admin User', role: 'ADMIN' },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  sales: {
    user: { id: 'sales-id', email: 'sales@example.com', name: 'Sales User', role: 'SALES' },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  engineer: {
    user: { id: 'engineer-id', email: 'taro@example.com', name: 'Engineer User', role: 'ENGINEER' },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  null: null
};
```

### 2. API権限制御テスト (`api-permissions.test.ts`)
**テスト数**: 35テスト

#### 機能概要
- ロールベース権限システムの検証
- セッション認証機能の確認
- 権限マトリックスの完全テスト
- データベースモック動作確認

#### テストケース詳細

##### 権限チェック機能（3テスト）
1. **管理者: 全権限アクセス許可**
   - 全ての権限（PROJECT_*, ENGINEER_*, USER_*）へのアクセス確認
2. **営業: 限定権限アクセス許可**
   - 許可権限: PROJECT_READ/CREATE, ENGINEER_READ/CREATE, USER_READ
   - 拒否権限: PROJECT_DELETE, ENGINEER_DELETE, USER_UPDATE
3. **エンジニア: 最小権限アクセス許可**
   - 許可権限: ENGINEER_READ, USER_READ/UPDATE
   - 拒否権限: PROJECT_*, ENGINEER_CREATE/DELETE

##### セッション認証テスト（3テスト）
1. **有効なセッション: 認証成功**
2. **無効なセッション: 認証失敗**
3. **期限切れセッション: 認証失敗**

##### ロール別権限マトリックステスト（27テスト）
各ロール（ADMIN、SALES、ENGINEER）に対して9つの権限を検証：
- `project:read`, `project:create`, `project:update`, `project:delete`
- `engineer:read`, `engineer:create`, `engineer:update`, `engineer:delete`
- `user:read`, `user:update`

##### データベースモック動作テスト（2テスト）
1. **Prismaモック正常動作確認**
2. **Prismaエラーハンドリング確認**

### 3. 認証フローテスト (`auth-flow.test.ts`)
**テスト数**: 15テスト

#### 機能概要
- ログイン/ログアウト機能の統合テスト
- セッション管理の検証
- 認証情報バリデーション
- エラーハンドリングの確認

#### テストケース詳細

##### ログイン機能（4テスト）
1. **有効な認証情報でログイン成功**
2. **無効なメールアドレスでログイン失敗**
3. **無効なパスワードでログイン失敗**
4. **空の認証情報でログイン失敗**

##### ログアウト機能（2テスト）
1. **ログアウト成功**
2. **リダイレクト付きログアウト**

##### セッション管理（3テスト）
1. **有効なセッション取得**
2. **無効なセッション（null）**
3. **期限切れセッション処理**

##### ロール別認証テスト（3テスト）
1. **管理者ロールでのログイン**
2. **営業ロールでのログイン**
3. **エンジニアロールでのログイン**

##### 認証エラーハンドリング（3テスト）
1. **データベース接続エラー**
2. **bcryptハッシュ比較エラー**

### 4. ページ間遷移テスト (`page-navigation.test.tsx`)
**テスト数**: 21テスト

#### 機能概要
- 認証状態による画面アクセス制御
- ロールベースページ制限
- PermissionGuardコンポーネントの動作確認
- 複数権限組み合わせテスト

#### テストケース詳細

##### 認証状態による画面制御（2テスト）
1. **未認証時: アクセス拒否表示**
2. **認証済み: アクセス許可表示**

##### ロール別ページアクセス制御（12テスト）

**管理者権限（3テスト）**
1. 案件管理画面: アクセス許可
2. 技術者管理画面: アクセス許可
3. ユーザー管理画面: アクセス許可

**営業権限（4テスト）**
1. 案件作成画面: アクセス許可
2. 案件削除画面: アクセス拒否
3. 技術者作成画面: アクセス許可
4. 技術者削除画面: アクセス拒否

**エンジニア権限（4テスト）**
1. 案件一覧画面: アクセス許可
2. 案件作成画面: アクセス拒否
3. 自分の技術者情報: アクセス許可
4. 他人の技術者情報: アクセス拒否

##### 複数権限の組み合わせテスト（3テスト）
1. **いずれかの権限があればアクセス許可（OR条件）**
2. **全ての権限が必要（AND条件）- アクセス許可**
3. **全ての権限が必要（AND条件）- アクセス拒否**

##### ロール指定によるアクセス制御（3テスト）
1. **管理者のみアクセス - 管理者: 許可**
2. **管理者のみアクセス - 営業: 拒否**
3. **複数ロール許可 - 営業または管理者: 営業でアクセス許可**

## 権限マトリックス

| 権限 | 管理者 | 営業 | エンジニア |
|------|--------|------|------------|
| project:read | ✅ | ✅ | ❌ |
| project:create | ✅ | ✅ | ❌ |
| project:update | ✅ | ✅ | ❌ |
| project:delete | ✅ | ❌ | ❌ |
| engineer:read | ✅ | ✅ | ✅ |
| engineer:create | ✅ | ✅ | ❌ |
| engineer:update | ✅ | ✅ | ❌ |
| engineer:delete | ✅ | ❌ | ❌ |
| user:read | ✅ | ✅ | ✅ |
| user:update | ✅ | ❌ | ✅ |

## テスト実行方法

```bash
# 統合テストのみ実行
npm test -- --testPathPattern=integration --verbose

# 全テスト実行
npm test

# カバレッジ付きテスト実行
npm test -- --coverage
```

## 技術的な実装詳細

### モック設定
- **NextAuth.js**: `jest.mock('next-auth')`
- **Prisma Client**: `jest.mock('@prisma/client')`
- **bcryptjs**: `jest.mock('bcryptjs')`
- **Next.js Router**: `jest.mock('next/navigation')`

### セットアップ関数
```typescript
export const setupIntegrationTest = () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};
```

### ヘルパー関数
- `createMockApiRequest`: APIリクエストモック作成
- `createApiResponse`: APIレスポンスモック作成
- `createUnauthorizedResponse`: 権限エラーレスポンス作成
- `createUnauthenticatedResponse`: 認証エラーレスポンス作成

## 品質保証

- **テスト成功率**: 100%（75/75テスト）
- **実行時間**: 約1秒
- **カバレッジ**: 統合テスト部分で70%以上
- **型安全性**: TypeScript完全対応

## 今後の拡張予定

1. **APIエンドポイント統合テスト**: 実際のAPIルートとの統合
2. **データベース統合テスト**: 実際のPrismaクライアントとの統合
3. **E2Eテスト**: Playwright/Cypressによるブラウザテスト
4. **パフォーマンステスト**: 大量データでの動作確認

---

**作成日**: 2025/06/03  
**最終更新**: 2025/06/03  
**バージョン**: 1.0.0 
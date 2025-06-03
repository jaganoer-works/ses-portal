# SES案件・技術者管理システム

エンタープライズレベルのSES（System Engineering Service）案件と技術者を管理する包括的なWebアプリケーションです。

## 🎯 プロジェクト概要

SES事業における案件管理・技術者管理・やりとり管理を一元化し、管理者・営業・エンジニアの3つのロールによる詳細な権限制御を実現したシステムです。

### 主要機能
- **案件管理**：案件の登録・編集・一覧表示・詳細表示・ステータス管理
- **技術者管理**：技術者の登録・編集・プロフィール管理・スキル管理
- **やりとり管理**：案件と技術者間のメッセージ・進捗管理・履歴追跡
- **認証・権限管理**：ロールベースアクセス制御（RBAC）による細かい権限管理
- **ユーザー管理**：管理者・営業・エンジニアのアカウント管理

### 🔐 権限システム
**33種類の詳細権限による包括的制御**
- **管理者**：全権限（17権限）
- **営業**：案件・技術者の作成・更新、やりとり管理（10権限）
- **エンジニア**：自身の情報管理・やりとり参照（6権限）

## 🚀 技術スタック

### フロントエンド
- **Next.js 15.3.3** - React フレームワーク（App Router）
- **React 19** - ユーザーインターフェース
- **TypeScript 5** - 型安全性
- **Tailwind CSS 4** - スタイリング

### バックエンド・データベース
- **Next.js API Routes** - RESTful API
- **Prisma ORM 6.8.2** - データベースアクセス
- **SQLite** - データベース（開発環境）

### 認証・セキュリティ
- **NextAuth.js v5** - 認証システム
- **bcryptjs** - パスワードハッシュ化
- **JWT** - セッション管理
- **Zod** - バリデーション

### 開発・テスト
- **Jest 29.7.0** - テストフレームワーク
- **React Testing Library 16.3.0** - コンポーネントテスト
- **ESLint 9** - コード品質
- **Prettier** - コードフォーマット

## 🛠️ セットアップ・起動方法

### 必要な環境
- **Node.js** 18以上
- **npm** または **yarn**

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd ses-app
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
```bash
cp .env.example .env
```

`.env`ファイルを編集：
```bash
# データベース
DATABASE_URL="file:./dev.db"

# 認証
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. データベースのセットアップ
```bash
# Prismaクライアント生成
npx prisma generate

# マイグレーション実行
npx prisma migrate dev

# 初期データ投入
npx prisma db seed
```

### 5. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションが http://localhost:3000 で起動します。

## 🧪 テスト実行

### テストコマンド
```bash
# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ確認
npm run test:coverage

# CI環境用
npm run test:ci
```

### テスト実装状況
- **単体テスト**: ✅ 78テスト成功（100%完了）
  - 権限システム（33テスト）
  - usePermissionsフック（20テスト）
  - ユーティリティ関数（21テスト）
  - 基本セットアップ（4テスト）
- **カバレッジ**: 70%閾値設定済み

## 👥 デモアカウント

開発・テスト用のアカウントが用意されています：

| ロール | メールアドレス | パスワード | 権限 |
|--------|----------------|------------|------|
| 管理者 | admin@example.com | admin123 | 全権限（17権限） |
| 営業 | sales@example.com | password123 | 案件・技術者管理（10権限） |
| エンジニア | taro@example.com | password123 | 自身の情報管理（6権限） |

## 📁 プロジェクト構成

```
ses-app/
├── prisma/                 # データベース・スキーマ
│   ├── schema.prisma       # Prismaスキーマ定義
│   ├── migrations/         # マイグレーションファイル
│   └── dev.db             # SQLite開発DB
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # APIルートハンドラ
│   │   ├── auth/          # 認証ページ
│   │   ├── projects/      # 案件管理
│   │   ├── engineers/     # 技術者管理
│   │   └── interactions/  # やりとり管理
│   ├── components/        # 再利用可能コンポーネント
│   │   ├── ui/           # 基本UIコンポーネント
│   │   ├── forms/        # フォームコンポーネント
│   │   ├── layout/       # レイアウトコンポーネント
│   │   └── auth/         # 認証・権限コンポーネント
│   ├── hooks/            # カスタムReactフック
│   ├── lib/              # ライブラリ・ユーティリティ
│   │   ├── auth.ts       # NextAuth.js設定
│   │   ├── permissions.ts # 権限制御システム
│   │   └── prisma.ts     # Prismaクライアント
│   └── __tests__/        # テストファイル
├── jest.config.js         # Jest設定
├── next.config.ts         # Next.js設定
└── tailwind.config.ts     # Tailwind CSS設定
```

## 🔐 権限システム詳細

### ロール定義
```typescript
enum Role {
  ADMIN = "admin",     // 管理者
  SALES = "sales",     // 営業
  ENGINEER = "engineer" // エンジニア
}
```

### 権限マトリックス

| 機能 | 管理者 | 営業 | エンジニア |
|------|--------|------|------------|
| **案件管理** |
| 案件読み取り | ✅ | ✅ | ✅ |
| 案件作成 | ✅ | ✅ | ❌ |
| 案件更新 | ✅ | ✅ | ❌ |
| 案件削除 | ✅ | ❌ | ❌ |
| **技術者管理** |
| 技術者読み取り | ✅ | ✅ | ✅(自分のみ) |
| 技術者作成 | ✅ | ✅ | ❌ |
| 技術者更新 | ✅ | ✅ | ✅(自分のみ) |
| 技術者削除 | ✅ | ❌ | ❌ |
| **やりとり管理** |
| やりとり読み取り | ✅ | ✅ | ✅ |
| やりとり作成 | ✅ | ✅ | ✅ |
| やりとり更新 | ✅ | ✅ | ✅ |
| やりとり削除 | ✅ | ❌ | ❌ |
| **ユーザー管理** |
| ユーザー読み取り | ✅ | ✅ | ✅(自分のみ) |
| ユーザー作成 | ✅ | ❌ | ❌ |
| ユーザー更新 | ✅ | ❌ | ✅(自分のみ) |
| ユーザー削除 | ✅ | ❌ | ❌ |
| **システム管理** |
| システム管理 | ✅ | ❌ | ❌ |

## 🛡️ セキュリティ対策

### 認証・認可
- **NextAuth.js v5**による堅牢な認証
- **JWT**によるステートレスセッション管理
- **bcryptjs**によるパスワードハッシュ化
- **ミドルウェア**による全ルート保護

### 入力バリデーション
- **Zod**による型安全なバリデーション
- **Prisma**によるSQL インジェクション対策
- **TypeScript**による型安全性確保

### アクセス制御
- **RBAC**（ロールベースアクセス制御）
- **リソース所有者チェック**
- **API エンドポイント保護**
- **フロントエンド画面制御**

## 🚀 デプロイ

### Vercelでのデプロイ
```bash
# Vercel CLIのインストール
npm i -g vercel

# デプロイ
vercel

# 本番環境の環境変数設定
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
```

### 環境変数（本番）
```bash
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
DATABASE_URL="your-production-database-url"
```

## 📝 開発ガイド

### コーディング規約
- **TypeScript**厳格モードの使用
- **ESLint + Prettier**でのコード品質維持
- **単一責任の原則**によるコンポーネント設計
- **カスタムフック**による状態管理の分離

### テスト戦略
- **単体テスト**：ユーティリティ関数・フック
- **コンポーネントテスト**：UI コンポーネント
- **統合テスト**：API・認証フロー
- **E2Eテスト**：ユーザージャーニー

### パフォーマンス最適化
- **React.memo**による不要な再レンダリング防止
- **useMemo/useCallback**による計算の最適化
- **Next.js**の自動最適化機能活用
- **Tailwind CSS**による軽量スタイリング

## 📚 関連ドキュメント

- [要件定義書](../requirements.md)
- [データモデル設計書](../datamodel.md)
- [技術スタック](../technologystack.md)
- [Git運用ルール](../git_rules.md)
- [進捗管理](../progress.md)

## 🤝 コントリビューション

1. **Issue**の確認・作成
2. **feature/xxx**ブランチの作成
3. **実装・テスト**の追加
4. **プルリクエスト**の作成
5. **レビュー・マージ**

## 📄 ライセンス

このプロジェクトは私的利用のため、特定のライセンスは設定されていません。

---

**開発者**: SESプロジェクトチーム  
**最終更新**: 2025/06/03  
**進捗率**: 90%完了（テスト実装完了）

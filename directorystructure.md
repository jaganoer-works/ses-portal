# 【2025/06/03時点】ディレクトリ構成

```
./
├── datamodel.md                # データモデル設計書
├── directorystructure.md       # ディレクトリ構成ドキュメント
├── git_rules.md                # Git運用ルール
├── requirements.md             # 要件定義書
├── technologystack.md          # 技術スタック定義
├── troubleshooting.md          # トラブルシューティング
├── implementation_guideline.md # 実装ガイドライン
├── progress.md                 # 開発進捗管理
├── ses-app/                    # Next.jsアプリ本体
│   ├── prisma/                 # Prismaスキーマ・DB・マイグレーション
│   │   ├── dev.db              # SQLite開発DB
│   │   ├── schema.prisma       # Prismaスキーマ定義
│   │   └── migrations/         # DBマイグレーションファイル
│   ├── public/                 # 静的ファイル
│   ├── src/                    # アプリケーションソース
│   │   ├── app/                # Next.js App Router（ページ/レイアウト/ルートハンドラ）
│   │   │   ├── api/            # APIルートハンドラ
│   │   │   │   ├── engineers/  # 技術者API
│   │   │   │   │   └── [id]/   # 技術者個別API
│   │   │   │   ├── interactions/ # やりとりAPI
│   │   │   │   │   └── [id]/   # やりとり個別API
│   │   │   │   ├── projects/   # 案件API
│   │   │   │   │   └── [id]/   # 案件個別API
│   │   │   │   └── users/      # ユーザーAPI
│   │   │   │       └── [id]/   # ユーザー個別API
│   │   │   ├── engineers/      # 技術者管理ページ
│   │   │   │   ├── components/ # 技術者専用コンポーネント
│   │   │   │   │   ├── EngineerCard.tsx    # 技術者カード
│   │   │   │   │   ├── EngineerForm.tsx    # 技術者フォーム
│   │   │   │   │   └── ErrorBoundary.tsx   # エラーバウンダリ
│   │   │   │   ├── [id]/       # 技術者詳細・編集
│   │   │   │   │   └── edit/   # 技術者編集ページ
│   │   │   │   ├── new/        # 技術者新規作成
│   │   │   │   ├── loading.tsx # ローディングページ
│   │   │   │   └── page.tsx    # 技術者一覧ページ
│   │   │   ├── interactions/   # やりとり管理ページ
│   │   │   │   ├── components/ # やりとり専用コンポーネント
│   │   │   │   │   ├── InteractionCard.tsx   # やりとりカード
│   │   │   │   │   ├── InteractionForm.tsx   # やりとりフォーム
│   │   │   │   │   └── InteractionFilter.tsx # やりとりフィルタ
│   │   │   │   ├── [id]/       # やりとり詳細・編集
│   │   │   │   │   └── edit/   # やりとり編集ページ
│   │   │   │   ├── new/        # やりとり新規作成
│   │   │   │   └── page.tsx    # やりとり一覧ページ
│   │   │   ├── projects/       # 案件管理ページ
│   │   │   │   ├── components/ # 案件専用コンポーネント
│   │   │   │   │   ├── ProjectCard.tsx    # 案件カード
│   │   │   │   │   ├── ProjectForm.tsx    # 案件フォーム
│   │   │   │   │   └── ErrorBoundary.tsx  # エラーバウンダリ
│   │   │   │   ├── [id]/       # 案件詳細・編集
│   │   │   │   │   └── edit/   # 案件編集ページ
│   │   │   │   ├── new/        # 案件新規作成
│   │   │   │   ├── loading.tsx # ローディングページ
│   │   │   │   └── page.tsx    # 案件一覧ページ
│   │   │   ├── layout.tsx      # ルートレイアウト
│   │   │   ├── page.tsx        # ホームページ
│   │   │   └── globals.css     # グローバルCSS
│   │   ├── components/         # 再利用可能なReactコンポーネント
│   │   │   ├── ui/             # 基本UIコンポーネント
│   │   │   │   ├── Button.tsx     # ボタンコンポーネント
│   │   │   │   ├── Card.tsx       # カードコンポーネント
│   │   │   │   ├── ErrorDisplay.tsx # エラー表示コンポーネント
│   │   │   │   ├── Loading.tsx    # ローディングコンポーネント
│   │   │   │   └── index.ts       # UIコンポーネント一括エクスポート
│   │   │   ├── forms/          # フォーム関連コンポーネント
│   │   │   │   ├── FormField.tsx  # 統一フォームフィールド
│   │   │   │   ├── FormActions.tsx # フォームアクション管理
│   │   │   │   └── index.ts       # フォームコンポーネント一括エクスポート
│   │   │   └── layout/         # レイアウト関連コンポーネント（予約）
│   │   ├── hooks/              # カスタムReactフック
│   │   │   ├── useApi.ts          # API呼び出し管理フック
│   │   │   ├── useForm.ts         # フォーム状態管理フック
│   │   │   ├── useInteractions.ts # やりとり管理フック
│   │   │   └── index.ts           # カスタムフック一括エクスポート
│   │   ├── lib/                # ライブラリ・ユーティリティ関数
│   │   │   ├── api/            # API通信関連
│   │   │   ├── schema/         # バリデーションスキーマ
│   │   │   └── types/          # 型定義
│   │   └── ...                 # その他設定ファイル
│   ├── package.json            # 依存関係・スクリプト定義
│   ├── tsconfig.json           # TypeScript設定
│   ├── next.config.ts          # Next.js設定
│   ├── tailwind.config.ts      # Tailwind CSS設定
│   ├── .env                    # 環境変数
│   └── README.md               # プロジェクト説明
└── ...
```

## 実装状況（2025/06/03時点）

### ✅ 完了済み機能
- **データベース設計**: Prismaスキーマ・マイグレーション完了
- **API実装**: 案件・技術者・やりとり・ユーザーの完全CRUD
- **画面実装**: 各管理画面の一覧・詳細・新規・編集ページ
- **コンポーネント分割**: 再利用可能なUIコンポーネント・フォームコンポーネント構築
- **カスタムフック**: API呼び出し・フォーム管理・状態管理フック実装
- **型安全性**: TypeScript完全対応・型定義整備
- **認証システム**: NextAuth.js v5 + Prisma + bcryptjs完全実装
- **権限制御システム**: ロールベースアクセス制御（RBAC）完全実装
- **テストシステム**: Jest + React Testing Library基盤・単体テスト完了

### 📊 テスト実装状況詳細
- **基盤セットアップ**: ✅ 完了（4テスト成功）
- **権限システム**: ✅ 完了（33テスト成功）
- **usePermissionsフック**: ✅ 完了（20テスト成功）
- **ユーティリティ関数**: ✅ 完了（21テスト成功）
- **コンポーネントテスト**: ✅ 完了（90テスト成功）
  - PermissionGuard認証・権限制御（18テスト）
  - Buttonコンポーネント（13テスト）
  - Loadingコンポーネント（20テスト）
  - Cardコンポーネント（39テスト）
- **総テスト数**: 168テスト全て成功 🎉
- **実行時間**: 1.647秒
- **カバレッジ**: 70%閾値設定済み

### 🚧 実装中・未完了機能
- **統合テスト**: API権限制御・認証フロー
- **E2Eテスト**: ユーザージャーニー全体
- **ドキュメント**: Storybook・APIドキュメント詳細

## コンポーネント設計原則

### 📁 ディレクトリ分類ルール

#### `src/components/`（共通コンポーネント）
- **ui/**: 基本的なUIコンポーネント（Button、Card、Loading、ErrorDisplay等）
- **forms/**: フォーム関連の共通コンポーネント（FormField、FormActions等）
- **layout/**: レイアウト・ナビゲーション関連コンポーネント（将来実装予定）

#### `src/app/[feature]/components/`（機能専用コンポーネント）
- 各機能固有のコンポーネント（ProjectCard、EngineerForm、InteractionFilter等）
- ページ専用のビジネスロジックを含むコンポーネント

#### `src/hooks/`（カスタムフック）
- 状態管理・副作用処理のカスタムフック
- API呼び出し・フォーム管理・ドメイン固有ロジック

### 🎯 再利用性の指針
1. **3回以上使用される**: `src/components/ui/` または `src/components/forms/` に配置
2. **機能固有**: `src/app/[feature]/components/` に配置
3. **ビジネスロジック**: カスタムフック（`src/hooks/`）に分離
4. **インデックスファイル**: 各ディレクトリに `index.ts` でエクスポート統一

## 技術仕様

### フロントエンド
- **Next.js 15.3.3** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS** (スタイリング)
- **Prisma** (ORM) + **SQLite** (開発DB)

### コンポーネントライブラリ
- **UIコンポーネント**: Button、Card、Loading、ErrorDisplay
- **フォームコンポーネント**: FormField、FormActions、FormContainer
- **カスタムフック**: useApi、useForm、useInteractions

### コード品質
- **ESLint** + **Prettier** (コードフォーマット)
- **TypeScript 厳格モード** (型安全性)
- **単一責任の原則** (コンポーネント設計)

## 運用・拡張のポイント

### 新機能追加時の手順
1. `src/app/[新機能名]/` ディレクトリを作成
2. 専用コンポーネントは `components/` サブディレクトリに配置
3. 共通化可能なコンポーネントは `src/components/` に移動・統合
4. 状態管理は `src/hooks/` にカスタムフック作成
5. インデックスファイルでエクスポートを統一

### コードレビューポイント
- コンポーネントの単一責任確認
- TypeScript型定義の適切性
- 再利用性の検証（3回ルール）
- パフォーマンス影響（不要な再レンダリング等）

## 未確定事項 & TODO

### 📋 次期実装予定（優先度順）
1. **認証機能**: ログイン・ログアウト画面・セッション管理
2. **権限管理**: ロールベースアクセス制御システム
3. **テストコード**: Jest + Testing Library によるユニットテスト
4. **Storybook**: コンポーネントカタログ・ドキュメント生成
5. **CI/CDパイプライン**: GitHub Actions によるビルド・デプロイ自動化

### 🔧 将来的な改善案
- [ ] パフォーマンス最適化（React.memo、useMemo、useCallback適用）
- [ ] エラーバウンダリーの全画面対応
- [ ] PWA対応（Service Worker、アプリマニフェスト）
- [ ] 国際化対応（react-i18next）
- [ ] E2Eテスト（Playwright）
- [ ] アクセシビリティ向上（ARIA対応、キーボードナビゲーション）

### 📈 パフォーマンス指標
- **初期表示**: 目標 < 3秒
- **画面遷移**: 目標 < 1秒
- **API応答**: 目標 < 500ms
- **バンドルサイズ**: 目標 < 1MB

---

**最終更新**: 2025/06/03 - コンポーネントテスト実装完了（168テスト全成功）  
**進捗率**: 約95%完了（基本機能・認証・権限・単体テスト・コンポーネントテスト完了）

# 実装ガイドライン（SES案件・技術者管理アプリ/MVP）

---

## プロジェクト開始時の手順・推奨フロー

### 1. Next.jsプロジェクトの新規作成
- プロジェクトルートで以下のコマンドを実行：
  
  ```sh
  npx create-next-app@15.3.2 ses-app
  ```
- コマンド実行後、対話形式で質問が表示されるので、以下のように回答すること：
  - **TypeScriptを使いますか？** → Yes（y）
  - **src/ ディレクトリを使いますか？** → Yes（y）
  - **App Router（app/ ディレクトリ）を使いますか？** → Yes（y）
  - **Tailwind CSSを使いますか？** → Yes（y）
  - **ESLintを使いますか？** → Yes（y）
  - **@/のエイリアスを使いますか？** → Yes（y）
  - **Gitリポジトリを初期化しますか？** → 必要に応じて
- これにより、`ses-app/src/app`ルート構成のNext.jsプロジェクトが作成される。

### 2. 追加セットアップ
- Prisma, NextAuth.js, shadcn/ui などの導入は、プロジェクト作成後に必要に応じて実施する。
- ディレクトリ構成・命名規則・コーディング規約は本ガイドラインおよび`directorystructure.md`に従うこと。

---

## 1. コーディング規約
- **TypeScript/JavaScriptはESLint・Prettierの設定に従うこと**
- 型安全・null安全を徹底し、`any`や型アサーションの多用は避ける
- 可能な限り関数型・宣言的な記述を推奨

## 2. ディレクトリ構成・ファイル配置
- `directorystructure.md`に準拠し、`src/`配下は`app/`, `pages/`, `components/`, `styles/`など役割ごとに整理
- 共通処理・ユーティリティは`src/utils/`等に集約
- 大規模化時はドメイン単位でディレクトリ分割を検討

## 3. 命名規則
- 変数・関数：キャメルケース（例：userList, fetchData）
- コンポーネント・クラス：パスカルケース（例：UserCard, AuthProvider）
- ファイル・ディレクトリ：英語小文字＋ハイフン区切り（例：user-list.tsx）
- Prismaスキーマ：単数形モデル名、snake_caseカラム名

## 4. コンポーネント設計
- 再利用性・単一責任を意識し、複雑なUIは分割
- UIはshadcn/ui＋Tailwind CSSを基本とし、独自CSSは最小限
- propsの型定義は必須、childrenの型も明示

## 5. API・DB設計
- API RoutesはREST原則に従い、エンドポイントは英語・小文字・複数形
- Prismaスキーマは`prisma/schema.prisma`で一元管理、マイグレーションは`prisma migrate`で実施
- バリデーション・エラーハンドリングは共通化し、APIレスポンスは一貫性を持たせる

## 6. 認証・認可
- NextAuth.jsの設定は`src/auth/`等に集約
- セッション管理・認可ロジックはサーバー側で厳格に
- 機密情報は`.env`で管理し、Git管理外とする

## 7. スタイル・デザイン
- Tailwind CSSユーティリティを優先し、カスタムCSSは`src/styles/`に限定
- shadcn/uiのカスタマイズは公式推奨手順に従う
- デザインの一貫性を保つため、色・余白・フォント等は共通変数を活用

## 8. テスト
- ユニットテストはJest＋Testing Libraryを推奨
- 主要なロジック・コンポーネントは必ずテストを作成
- テストコードは`__tests__/`または`*.test.ts(x)`で管理

## 9. Git運用・レビュー
- `git_rules.md`に従い、ブランチ・コミット・PR運用を厳守
- PRレビュー時は「可読性」「保守性」「セキュリティ」「パフォーマンス」観点で確認
- レビュー指摘は必ず対応・記録

## 10. ドキュメント
- 主要な設計・仕様は`README.md`や`requirements.md`等に記載
- 複雑な処理・API・DBスキーマはコードコメントも活用
- ドキュメントの配置・更新ルールはチームで合意の上運用

## 11. その他
- 環境変数・シークレットは`.env`で管理し、`.env.example`も用意
- パフォーマンス・アクセシビリティも考慮（例：画像最適化、alt属性付与等）
- 本番運用・デプロイ時はVercelの公式手順に従う

---

### 参考・関連ドキュメント
- [ディレクトリ構成](./directorystructure.md)
- [Git運用ルール](./git_rules.md)
- [技術スタック](./technologystack.md)
- [要件定義書](./requirements.md)

--- 
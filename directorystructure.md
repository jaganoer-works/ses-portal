# 【2025/06/01時点】ディレクトリ構成案

```
./
├── datamodel.md            # データモデル設計書
├── directorystructure.md   # ディレクトリ構成ドキュメント
├── git_rules.md            # Git運用ルール
├── requirements.md         # 要件定義書
├── technologystack.md      # 技術スタック定義
├── troubleshooting.md      # トラブルシューティング
├── ses-app/                # Next.jsアプリ本体
│   ├── prisma/             # Prismaスキーマ・DB・マイグレーション
│   │   ├── dev.db
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── public/             # 静的ファイル
│   ├── src/                # アプリケーションソース
│   │   ├── app/            # Next.js App Router（ページ/レイアウト/ルートハンドラ）
│   │   ├── components/     # 再利用可能なReactコンポーネント
│   │   ├── features/       # ドメインごとの機能単位ディレクトリ
│   │   ├── hooks/          # カスタムReactフック
│   │   ├── lib/            # ライブラリ・ユーティリティ関数
│   │   ├── types/          # 型定義（TypeScript用）
│   │   ├── styles/         # グローバル/モジュールCSS・Tailwind設定
│   │   ├── api/            # APIクライアント・外部通信
│   │   ├── constants/      # 定数
│   │   └── tests/          # テストコード
│   ├── ...                 # 設定ファイル類
└── ...
```

- `components/`：汎用Reactコンポーネント
- `features/`：ドメインごとの機能単位（例：user, dashboard等）
- `hooks/`：カスタムReactフック
- `lib/`：共通ロジック・ユーティリティ
- `types/`：型定義
- `api/`：APIクライアント・外部通信
- `constants/`：定数
- `tests/`：テストコード
- `styles/`：グローバル/モジュールCSS・Tailwind設定

---

## 運用・拡張のポイント

- 新機能追加時は`features/`配下にドメイン単位でディレクトリを作成
- 共通処理や型定義は`lib/`や`types/`に集約
- Storybookやドキュメント生成が必要な場合は`storybook/`や`docs/`を新設
- 設定ファイルやCI/CD用スクリプトはプロジェクトルートまたは`ses-app/`直下に配置

---

## 未確定事項 & TODO

- `features/`ディレクトリの具体的なドメイン分割方針
- Storybookや`docs/`ディレクトリの要否
- テストコードの配置方針（`tests/`集中型 or 各ディレクトリ直下の`__tests__/`分散型）
- CI/CDや自動化スクリプトの配置場所

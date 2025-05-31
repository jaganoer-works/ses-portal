# ディレクトリ構成（プロジェクトルートから・2024/05/31時点）

```
./
├── datamodel.md
├── directorystructure.md
├── git_rules.md
├── requirements.md
├── technologystack.md
├── ses-app/
│   ├── README.md
│   ├── directorystructure.md
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── prisma/
│   │   ├── dev.db
│   │   └── schema.prisma
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── ...
│   ├── tailwind.config.mjs
│   ├── tsconfig.json
│   └── ...
└── ...
```

- `ses-app/`：Next.jsアプリ本体
  - `prisma/`：Prismaスキーマ・DBファイル
  - `src/`：アプリケーションのソースコード
  - `public/`：静的ファイル
  - その他：設定ファイル類
- プロジェクトルート直下：ドキュメント・ルールファイル

（`src/`配下の詳細や今後の追加ファイルは随時追記）

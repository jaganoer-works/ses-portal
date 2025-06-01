# 開発トラブルシューティング・ノウハウ集

## Prisma/TypeScript/ESM関連

- **ts-node + ESM + TypeScript seed実行時のエラー**
  - `Unknown file extension '.ts'` エラーが出る場合は、
    - `NODE_OPTIONS='--loader ts-node/esm' npx prisma db seed` で実行する
    - `tsconfig.json` の `module` を `ESNext` に、`package.json` に `"type": "module"` を追加

- **Skill配列の正規化**
  - SQLite+Prismaではプリミティブ配列（String[]）が使えないため、中間テーブル（UserSkill）で多対多リレーションを実装

- **Skillの重複投入エラー**
  - `createMany`でユニーク制約違反が出た場合は、DBリセット（`npx prisma migrate reset --force`）や、事前にtruncate処理を入れる

## その他

- **Prisma StudioでGUI確認**
  - `npx prisma studio` でWebブラウザからDB内容を確認・編集できる

- **シードスクリプトのESM対応**
  - ESM/TypeScriptの組み合わせはNode.jsのバージョンや設定に注意

---

随時追記・更新してください！ 
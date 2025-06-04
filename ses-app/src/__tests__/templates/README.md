# 統合テストテンプレート

このディレクトリには、SESアプリケーションで再利用可能な統合テストテンプレートが含まれています。

## 📋 テンプレート一覧

### 1. サーバーコンポーネント統合テスト
**ファイル**: `server-component-integration.template.tsx`  
**用途**: サーバーコンポーネントページ（特に編集ページ）の401エラー対策と包括的テスト

## 🚀 使用方法

### Step 1: テンプレートファイルをコピー
```bash
cp src/__tests__/templates/server-component-integration.template.tsx \
   src/__tests__/integration/your-feature-pages.test.tsx
```

### Step 2: TODOコメントを実際の値に置換

以下のTODOコメントを実際の値に置き換えてください：

#### 必須置換項目
```typescript
// 1. ページコンポーネントのインポート
// import EditPageComponent, { generateMetadata } from '@/app/[resource]/[id]/edit/page';
import EditEngineerPage, { generateMetadata } from '@/app/engineers/[id]/edit/page';

// 2. Prismaテーブル名
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {  // 'tableName' を 'user' に変更
      findUnique: jest.fn(),
    },
  },
}));

// 3. データ型定義
interface TestDataType {
  id: string;
  name: string;
  email: string;  // 実際のフィールドに変更
  // ... その他のフィールド
}

// 4. モックデータ
const mockData: TestDataType = {
  id: 'test-engineer-id',
  name: '田中太郎',
  email: 'tanaka@example.com',
  // ... 実際のデータ構造に合わせて
};
```

#### テスト内容の置換
```typescript
// 5. Prismaクエリの期待値
expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
  where: { id: 'test-engineer-id' },
  include: {
    skills: {  // 実際のリレーションに変更
      include: {
        skill: true,
      },
    },
  },
});

// 6. ページコンポーネント呼び出し
const result = await EditEngineerPage({ params });

// 7. メタデータテスト
expect(metadata.title).toBe('田中太郎を編集 | SES管理システム');

// 8. APIエンドポイント
const response = await fetch('/api/engineers/test-id');
```

### Step 3: 不要な部分を削除

generateMetadataがない場合は、該当するテストブロックを削除：
```typescript
// generateMetadataがない場合は削除
describe('generateMetadata関数のテスト', () => {
  // ... このブロック全体を削除
});
```

## 📚 実装例

### エンジニア編集ページの例
```typescript
// src/__tests__/integration/engineer-pages.test.tsx

import { render } from '@testing-library/react';
import { notFound } from 'next/navigation';
import EditEngineerPage, { generateMetadata } from '@/app/engineers/[id]/edit/page';
import { setupIntegrationTest } from './setup';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// ... 残りの実装
```

## 🎯 テストカバレッジ

このテンプレートは以下のテストカバレッジを提供します：

### ✅ 機能テスト
- [ ] データ取得成功テスト
- [ ] データ未発見時のnotFound()テスト  
- [ ] データベースエラー時のエラーハンドリング
- [ ] メタデータ生成テスト（該当する場合）

### ✅ レンダリングテスト
- [ ] 正常データでの表示確認
- [ ] エラー時の適切な処理

### ✅ 回帰テスト
- [ ] 401エラー回避の実証
- [ ] Prisma直接アクセスの動作確認

## 🔧 カスタマイズポイント

### データ構造の違い
```typescript
// リレーションがある場合
include: {
  skills: {
    include: {
      skill: true,
    },
  },
}

// リレーションがない場合
// includeブロック全体を削除
```

### Date型変換の違い
```typescript
// エンジニアの場合
availableFrom: engineer.availableFrom?.toISOString().split('T')[0] || null,

// プロジェクトの場合  
periodStart: project.periodStart.toISOString().split('T')[0],
periodEnd: project.periodEnd.toISOString().split('T')[0],
```

### 複数テーブルアクセスの場合
```typescript
// インタラクションのように複数のfindUniqueが必要な場合
jest.mock('@/lib/prisma', () => ({
  prisma: {
    interaction: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));
```

## 🚨 注意事項

1. **テーブル名の統一**: Prismaのテーブル名とモックのテーブル名を一致させてください
2. **型定義の正確性**: TypeScriptの型定義を実際のデータ構造と一致させてください
3. **リレーションの確認**: includeブロックは実際のPrismaスキーマと一致させてください
4. **Date型の処理**: 各リソースのDate型フィールドの変換処理を正確に実装してください

## 📈 ベストプラクティス

### 1. 段階的実装
1. 基本的な成功ケースから実装
2. エラーケースを追加
3. 401エラー実証テストで完了

### 2. デバッグ支援
```typescript
// デバッグ時のコンソール出力確認
console.log('Mock call args:', mockPrisma.user.findUnique.mock.calls);
```

### 3. テスト駆動開発
1. テストを先に作成
2. 実装を後から追加
3. テストが通ることを確認

## 🎉 完成時の確認

テンプレート実装完了後、以下を確認してください：

```bash
# テスト実行
npm test your-feature-pages.test.tsx

# カバレッジ確認  
npm run test:coverage

# 全テスト実行
npm test
```

期待される結果：
- ✅ 全テストパス
- ✅ 401エラーの回避確認
- ✅ 包括的なエラーハンドリング
- ✅ 適切なPrismaモック動作

---

このテンプレートを活用することで、一貫性のある高品質な統合テストを効率的に作成できます。 
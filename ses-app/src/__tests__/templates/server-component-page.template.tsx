import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
// TODO: 実際の型をインポート
// import { DataType } from "@/lib/types/resource";
// TODO: 実際のコンポーネントをインポート
// import { ResourceForm } from "../../components/ResourceForm";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

// TODO: 実際のデータ型に置換
interface DataType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // TODO: 実際のフィールドを追加
}

// TODO: generateMetadataが必要ない場合は削除
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const data = await fetchData(id);
    return {
      // TODO: 実際のタイトルに変更
      title: `${data?.name}を編集 | SES管理システム`,
      description: `リソース「${data?.name}」の情報を編集します。`,
    };
  } catch {
    return {
      // TODO: 実際のデフォルトタイトルに変更
      title: "リソース編集 | SES管理システム",
      description: "リソースの情報を編集できます。",
    };
  }
}

// TODO: 関数名とデータ型を実際のものに変更
async function fetchData(id: string): Promise<DataType | null> {
  try {
    // TODO: 実際のテーブル名とクエリに変更（例: prisma.user, prisma.project, prisma.interaction）
    const data = await prisma.user.findUnique({
      where: { id },
      include: {
        // TODO: 実際のリレーションに変更（不要な場合は削除）
        // relationships: {
        //   include: {
        //     nestedRelation: true,
        //   },
        // },
      },
    });
    
    if (!data) {
      notFound();
    }
    
    // TODO: PrismaのDate型をstring型に変換してDataType型に適合させる
    return {
      ...data,
      // TODO: 実際のDate型フィールドに合わせて変更
      // availableFrom: data.availableFrom?.toISOString().split('T')[0] || null,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      // TODO: その他のDate型フィールドがあれば追加
    } as DataType;
  } catch (error) {
    // TODO: 実際のリソース名に変更
    console.error("データ取得エラー:", error);
    throw new Error("データの取得に失敗しました");
  }
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  
  let data: DataType | null;
  
  try {
    data = await fetchData(id);
  } catch (error) {
    // エラー時は404ページを表示
    return notFound();
  }

  if (!data) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8">
          <nav className="mb-4 flex gap-4">
            <Link 
              href="/resources" 
              className="text-accent hover:text-accent-dark transition-colors"
            >
              {/* TODO: 実際のリソース名に変更 */}
              ← リソース一覧
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href={`/resources/${id}`}
              className="text-accent hover:text-accent-dark transition-colors"
            >
              {/* TODO: 実際のリソース名に変更 */}
              リソース詳細
            </Link>
          </nav>
          
          <h1 className="text-2xl md:text-3xl font-bold text-accent">
            {/* TODO: 実際のページタイトルに変更 */}
            リソース編集
          </h1>
          <p className="text-sub mt-2">
            {/* TODO: 実際の表示名フィールドに変更 */}
            {data.name} の情報を編集します
          </p>
        </header>

        <div className="bg-card rounded-lg shadow-lg p-6">
          {/* TODO: 実際のフォームコンポーネントに変更 */}
          {/* <ResourceForm 
            mode="edit" 
            resourceId={id}
            initialData={data}
          /> */}
          <p>フォームコンポーネントをここに配置してください</p>
        </div>
      </div>
    </main>
  );
}

// TODO: 使用例コメント
/*
=== 使用例: エンジニア編集ページ ===

1. インポートの置換:
import { Engineer } from "@/lib/types/user";
import { EngineerForm } from "../../components/EngineerForm";

2. 型定義の置換:
async function fetchEngineer(id: string): Promise<Engineer | null>

3. Prismaクエリの置換:
const engineer = await prisma.user.findUnique({
  where: { id },
  include: {
    skills: {
      include: {
        skill: true,
      },
    },
  },
});

4. Date変換の置換:
return {
  ...engineer,
  availableFrom: engineer.availableFrom?.toISOString().split('T')[0] || null,
  createdAt: engineer.createdAt.toISOString(),
  updatedAt: engineer.updatedAt.toISOString(),
} as Engineer;

5. メタデータの置換:
title: `${engineer?.name}を編集 | SES管理システム`,
description: `技術者「${engineer?.name}」の情報を編集します。`,

6. UI要素の置換:
← 技術者一覧
技術者詳細
技術者編集
{engineer.name} さんの情報を編集します

7. フォームコンポーネントの置換:
<EngineerForm 
  mode="edit" 
  engineerId={id}
  initialData={engineer}
/>
*/ 
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Engineer } from "@/lib/types/user";
import { EngineerForm } from "../../components/EngineerForm";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const engineer = await fetchEngineer(id);
    return {
      title: `${engineer?.name}を編集 | SES管理システム`,
      description: `技術者「${engineer?.name}」の情報を編集します。`,
    };
  } catch {
    return {
      title: "技術者編集 | SES管理システム",
      description: "技術者の情報を編集できます。",
    };
  }
}

async function fetchEngineer(id: string): Promise<Engineer | null> {
  try {
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
    
    if (!engineer) {
      notFound();
    }
    
    // PrismaのDate型をstring型に変換してEngineer型に適合させる
    return {
      ...engineer,
      availableFrom: engineer.availableFrom?.toISOString().split('T')[0] || null,
      createdAt: engineer.createdAt.toISOString(),
      updatedAt: engineer.updatedAt.toISOString(),
    } as Engineer;
  } catch (error) {
    console.error("技術者データ取得エラー:", error);
    throw new Error("技術者データの取得に失敗しました");
  }
}

export default async function EditEngineerPage({ params }: Props) {
  const { id } = await params;
  
  let engineer: Engineer | null;
  
  try {
    engineer = await fetchEngineer(id);
  } catch (error) {
    // エラー時は404ページを表示
    return notFound();
  }

  if (!engineer) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8">
          <nav className="mb-4 flex gap-4">
            <Link 
              href="/engineers" 
              className="text-accent hover:text-accent-dark transition-colors"
            >
              ← 技術者一覧
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href={`/engineers/${id}`}
              className="text-accent hover:text-accent-dark transition-colors"
            >
              技術者詳細
            </Link>
          </nav>
          
          <h1 className="text-2xl md:text-3xl font-bold text-accent">
            技術者編集
          </h1>
          <p className="text-sub mt-2">
            {engineer.name} さんの情報を編集します
          </p>
        </header>

        <div className="bg-card rounded-lg shadow-lg p-6">
          <EngineerForm 
            mode="edit" 
            engineerId={id}
            initialData={engineer}
          />
        </div>
      </div>
    </main>
  );
} 
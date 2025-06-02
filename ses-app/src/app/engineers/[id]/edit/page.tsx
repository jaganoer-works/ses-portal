import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Engineer } from "@/lib/types/user";
import { EngineerForm } from "../../components/EngineerForm";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "技術者編集 | SES管理システム",
    description: `技術者（ID: ${id}）の情報を編集します。`,
  };
}

async function fetchEngineer(id: string): Promise<Engineer | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/engineers/${id}`, { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("技術者データ取得エラー:", error);
    return null;
  }
}

export default async function EditEngineerPage({ params }: Props) {
  const { id } = await params;
  const engineer = await fetchEngineer(id);
  
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
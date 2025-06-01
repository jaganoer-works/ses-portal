import { Metadata } from "next";
import Link from "next/link";
import { EngineerForm } from "../components/EngineerForm";

export const metadata: Metadata = {
  title: "新規技術者登録 | SES管理システム",
  description: "新しい技術者を登録します。",
};

export default function NewEngineerPage() {
  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8">
          <nav className="mb-4">
            <Link 
              href="/engineers" 
              className="text-accent hover:text-accent-dark transition-colors"
            >
              ← 技術者一覧に戻る
            </Link>
          </nav>
          
          <h1 className="text-2xl md:text-3xl font-bold text-accent">
            新規技術者登録
          </h1>
          <p className="text-sub mt-2">
            新しい技術者の情報を入力してください
          </p>
        </header>

        <div className="bg-card rounded-lg shadow-lg p-6">
          <EngineerForm mode="create" />
        </div>
      </div>
    </main>
  );
} 
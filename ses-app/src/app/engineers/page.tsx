import React from "react";
import { Metadata } from "next";
import { EngineerListItem } from "@/lib/types/user";
import { EngineerCard } from "./components/EngineerCard";
import { ErrorDisplay } from "./components/ErrorBoundary";

export const metadata: Metadata = {
  title: "技術者一覧 | SES管理システム",
  description: "SES管理システムの技術者一覧ページです。技術者のスキル、希望単価、稼働状況などを確認できます。",
};

async function fetchEngineers(): Promise<EngineerListItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/users`, { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: 技術者データの取得に失敗しました`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("技術者データ取得エラー:", error);
    throw error;
  }
}

export default async function EngineersPage() {
  let engineers: EngineerListItem[] = [];
  let error: string | null = null;

  try {
    engineers = await fetchEngineers();
  } catch (e) {
    error = e instanceof Error ? e.message : "技術者データの取得に失敗しました";
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
            技術者一覧
          </h1>
          <p className="text-sub">
            {engineers.length}名の技術者が登録されています
          </p>
        </header>

        {engineers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              技術者が登録されていません
            </h2>
            <p className="text-sub">
              まだ技術者が登録されていません。新しい技術者を登録してください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineers.map((engineer) => (
              <EngineerCard key={engineer.id} engineer={engineer} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 
import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { EngineerListItem } from "@/lib/types/user";
import { EngineerCard } from "./components/EngineerCard";
import { ErrorDisplay } from "./components/ErrorBoundary";
import { apiFetchWithError } from "@/lib/api/fetchService";

export const metadata: Metadata = {
  title: "技術者一覧 | SES管理システム",
  description: "SES管理システムの技術者一覧ページです。技術者のスキル、希望単価、稼働状況などを確認できます。",
};

async function fetchEngineers(): Promise<EngineerListItem[]> {
  return apiFetchWithError<EngineerListItem[]>("/api/engineers");
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
                技術者一覧
              </h1>
              <p className="text-sub">
                {engineers.length}名の技術者が登録されています
              </p>
            </div>
            
            <Link
              href="/engineers/new"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              新規登録
            </Link>
          </div>
        </header>

        {engineers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              技術者が登録されていません
            </h2>
            <p className="text-sub mb-6">
              まだ技術者が登録されていません。新しい技術者を登録してください。
            </p>
            <Link
              href="/engineers/new"
              className="inline-flex px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              最初の技術者を登録
            </Link>
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
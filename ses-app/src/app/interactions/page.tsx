"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Interaction } from "@/lib/types/project";
import { fetchInteractions, InteractionFilter } from "@/lib/api/interactions";
import { InteractionCard } from "./components/InteractionCard";
import { InteractionFilter as FilterComponent } from "./components/InteractionFilter";
import { ErrorDisplay } from "../projects/components/ErrorBoundary";

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [filteredInteractions, setFilteredInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InteractionFilter>({});

  const searchParams = useSearchParams();

  // URLパラメータから初期フィルタ設定
  useEffect(() => {
    const projectId = searchParams.get("project");
    const engineerId = searchParams.get("engineer");
    const isReadParam = searchParams.get("isRead");

    const initialFilter: InteractionFilter = {};
    if (projectId) initialFilter.project = projectId;
    if (engineerId) initialFilter.engineer = engineerId;
    if (isReadParam !== null) initialFilter.isRead = isReadParam === "true";

    setFilter(initialFilter);
  }, [searchParams]);

  // データ取得
  useEffect(() => {
    const loadInteractions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInteractions(filter);
        setInteractions(data);
        setFilteredInteractions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "やりとりデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadInteractions();
  }, [filter]);

  // フィルタ処理
  const handleFilterChange = (newFilter: InteractionFilter) => {
    setFilter(newFilter);
  };

  // やりとり削除後の更新
  const handleInteractionDeleted = (deletedId: string) => {
    const updated = interactions.filter(interaction => interaction.id !== deletedId);
    setInteractions(updated);
    setFilteredInteractions(updated);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-base py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-sub">読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* ナビゲーション */}
        <nav className="mb-6">
          <Link 
            href="/projects" 
            className="text-accent hover:text-accent-dark font-medium text-sm transition-colors"
          >
            ← 案件一覧に戻る
          </Link>
        </nav>

        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
                やりとり管理
              </h1>
              <p className="text-sub">
                {interactions.length}件のやりとりが登録されています
              </p>
            </div>
            
            <Link
              href="/interactions/new"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              新規やりとり
            </Link>
          </div>

          {/* フィルタ */}
          <FilterComponent 
            currentFilter={filter} 
            onFilterChange={handleFilterChange}
          />
        </header>

        {/* コンテンツ */}
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {filter.project || filter.engineer || filter.isRead !== undefined 
                ? "条件に一致するやりとりがありません" 
                : "やりとりが登録されていません"
              }
            </h2>
            <p className="text-sub mb-6">
              {filter.project || filter.engineer || filter.isRead !== undefined 
                ? "フィルタ条件を変更してください。" 
                : "まだやりとりが登録されていません。新しいやりとりを作成してください。"
              }
            </p>
            <Link
              href="/interactions/new"
              className="inline-flex px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              最初のやりとりを作成
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInteractions.map((interaction) => (
              <InteractionCard 
                key={interaction.id} 
                interaction={interaction} 
                onDeleted={handleInteractionDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 
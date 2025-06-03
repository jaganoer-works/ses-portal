"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Interaction } from "@/lib/types/project";
import { fetchInteractions, InteractionFilter } from "@/lib/api/interactions";
import { InteractionCard } from "./components/InteractionCard";
import { InteractionFilter as FilterComponent } from "./components/InteractionFilter";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { EmptyStateCard } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout";
import { PermissionGuard, SalesOrHigher } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions";

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [filteredInteractions, setFilteredInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InteractionFilter>({});

  const searchParams = useSearchParams();
  const permissions = usePermissions();

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

    if (permissions.canReadInteractions) {
      loadInteractions();
    } else {
      setError("やりとりを閲覧する権限がありません");
      setLoading(false);
    }
  }, [filter, permissions.isAuthenticated]);

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
      <PageLayout>
        <div className="text-center py-12">
          <Loading variant="dots" size="lg" />
          <p className="text-sub mt-4">やりとりデータを読み込み中...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorDisplay message={error} />
      </PageLayout>
    );
  }

  return (
    <PermissionGuard permissions={[Permission.INTERACTION_READ]}>
      <PageLayout>
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
            
            <PermissionGuard permissions={[Permission.INTERACTION_CREATE]}>
              <Link href="/interactions/new">
                <Button>新規やりとり</Button>
              </Link>
            </PermissionGuard>
          </div>

          {/* フィルタ */}
          <FilterComponent 
            currentFilter={filter} 
            onFilterChange={handleFilterChange}
          />
        </header>

        {/* コンテンツ */}
        {filteredInteractions.length === 0 ? (
          <EmptyStateCard
            icon="💬"
            title={
              filter.project || filter.engineer || filter.isRead !== undefined 
                ? "条件に一致するやりとりがありません" 
                : "やりとりが登録されていません"
            }
            description={
              filter.project || filter.engineer || filter.isRead !== undefined 
                ? "フィルタ条件を変更してください。" 
                : "まだやりとりが登録されていません。新しいやりとりを作成してください。"
            }
            action={
              <PermissionGuard permissions={[Permission.INTERACTION_CREATE]}>
                <Link href="/interactions/new">
                  <Button size="lg">最初のやりとりを作成</Button>
                </Link>
              </PermissionGuard>
            }
          />
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
      </PageLayout>
    </PermissionGuard>
  );
} 
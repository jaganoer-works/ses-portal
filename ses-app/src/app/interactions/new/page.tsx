"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createInteraction, CreateInteractionData, UpdateInteractionData } from "@/lib/api/interactions";
import { InteractionForm } from "../components/InteractionForm";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Loading } from "@/components/ui/Loading";
import { PageLayout } from "@/components/layout";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions";

export default function NewInteractionPage() {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [projects, setProjects] = useState<Array<{id: string, title: string}>>([]);
  const [engineers, setEngineers] = useState<Array<{id: string, name: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, canCreateInteractions, canReadProjects, canReadUsers } = usePermissions();

  // URLパラメータから初期値を取得
  const initialProjectId = searchParams.get("project") || "";
  const initialEngineerId = searchParams.get("engineer") || "";

  // プロジェクトと技術者の一覧を取得
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setDataLoading(true);
        setError(null);
        
        // 認証チェック
        if (!isAuthenticated) {
          setError("認証が必要です");
          return;
        }

        // 権限チェック
        if (!canCreateInteractions) {
          setError("やりとりを作成する権限がありません");
          return;
        }

        // プロジェクト一覧取得
        if (canReadProjects) {
          const projectsResponse = await fetch("/api/projects");
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData.map((p: any) => ({ id: p.id, title: p.title })));
          }
        }

        // 技術者一覧取得
        if (canReadUsers) {
          const engineersResponse = await fetch("/api/users");
          if (engineersResponse.ok) {
            const engineersData = await engineersResponse.json();
            setEngineers(engineersData.map((e: any) => ({ id: e.id, name: e.name })));
          }
        }
      } catch (error) {
        console.error("選択肢データの取得エラー:", error);
        setError("データの取得に失敗しました");
      } finally {
        setDataLoading(false);
      }
    };

    // 認証状態が確定してからAPI呼び出し
    if (isAuthenticated !== undefined) {
      fetchOptions();
    }
  }, [isAuthenticated, canCreateInteractions, canReadProjects, canReadUsers]);

  // フォーム送信処理
  const handleSubmit = async (data: CreateInteractionData | UpdateInteractionData) => {
    try {
      setLoading(true);
      // 新規作成時は必ずCreateInteractionDataの形式
      const createData = data as CreateInteractionData;
      const newInteraction = await createInteraction(createData);
      router.push(`/interactions/${newInteraction.id}`);
    } catch (error) {
      alert("やりとりの作成に失敗しました。");
      console.error("作成エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <Loading variant="dots" size="lg" />
          <p className="text-sub mt-4">データを読み込み中...</p>
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
    <PermissionGuard permissions={[Permission.INTERACTION_CREATE]}>
      <main className="min-h-screen bg-base py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* ナビゲーション */}
          <nav className="mb-6">
            <Link 
              href="/interactions" 
              className="text-accent hover:text-accent-dark font-medium text-sm transition-colors"
            >
              ← やりとり一覧に戻る
            </Link>
          </nav>

          {/* ヘッダー */}
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
              新規やりとり作成
            </h1>
            <p className="text-sub">
              案件と技術者の間の新しいやりとりを作成します
            </p>
          </header>

          {/* フォーム */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <InteractionForm
              mode="create"
              projects={projects}
              engineers={engineers}
              initialData={{
                projectId: initialProjectId,
                engineerId: initialEngineerId,
                message: "",
                progress: "",
              }}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </PermissionGuard>
  );
} 
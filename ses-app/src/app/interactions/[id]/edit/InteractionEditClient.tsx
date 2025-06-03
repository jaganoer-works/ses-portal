"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Interaction } from "@/lib/types/project";
import { updateInteraction, UpdateInteractionData } from "@/lib/api/interactions";
import { InteractionForm } from "../../components/InteractionForm";
import { usePermissions } from "@/hooks/usePermissions";

interface InteractionEditClientProps {
  interaction: Interaction;
}

export function InteractionEditClient({ interaction }: InteractionEditClientProps) {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [projects, setProjects] = useState<Array<{id: string, title: string}>>([]);
  const [engineers, setEngineers] = useState<Array<{id: string, name: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, canUpdateInteractions, canReadProjects, canReadUsers } = usePermissions();

  // プロジェクトと技術者の一覧を取得（編集時は表示のみ）
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
        if (!canUpdateInteractions) {
          setError("やりとりを編集する権限がありません");
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
  }, [isAuthenticated, canUpdateInteractions, canReadProjects, canReadUsers]);

  // フォーム送信処理
  const handleSubmit = async (data: UpdateInteractionData) => {
    try {
      setLoading(true);
      await updateInteraction(interaction.id, data);
      router.push(`/interactions/${interaction.id}`);
    } catch (error) {
      alert("やりとりの更新に失敗しました。");
      console.error("更新エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <main className="min-h-screen bg-base py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="text-sub mt-4">データを読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-base py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">エラー</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* ナビゲーション */}
        <nav className="mb-6">
          <Link 
            href={`/interactions/${interaction.id}`}
            className="text-accent hover:text-accent-dark font-medium text-sm transition-colors"
          >
            ← やりとり詳細に戻る
          </Link>
        </nav>

        {/* ヘッダー */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
            やりとり編集
          </h1>
          <p className="text-sub">
            やりとりの内容と進捗を更新できます
          </p>
        </header>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <InteractionForm
            mode="edit"
            projects={projects}
            engineers={engineers}
            initialData={{
              projectId: interaction.projectId,
              engineerId: interaction.engineerId,
              message: interaction.message,
              progress: interaction.progress || "",
            }}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </main>
  );
} 
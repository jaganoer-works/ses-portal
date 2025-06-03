"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProjectListItem } from "@/lib/types/project";
import { ProjectCard } from "./components/ProjectCard";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { EmptyStateCard } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout";
import { PermissionGuard, SalesOrHigher } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions";

async function fetchProjects(): Promise<ProjectListItem[]> {
  try {
    const res = await fetch("/api/projects", { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: 案件データの取得に失敗しました`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("案件データ取得エラー:", error);
    throw error;
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, canReadProjects } = usePermissions();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 認証チェック
        if (!isAuthenticated) {
          setError("認証が必要です");
          return;
        }
        
        // 権限チェック
        if (!canReadProjects) {
          setError("案件を閲覧する権限がありません");
          return;
        }
        
        const data = await fetchProjects();
        setProjects(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "案件データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    // 認証状態が確定してからAPI呼び出し
    if (isAuthenticated !== undefined) {
      loadProjects();
    }
  }, [isAuthenticated]); // 認証状態のみを依存関係にする

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <Loading variant="dots" size="lg" />
          <p className="text-sub mt-4">案件データを読み込み中...</p>
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
    <PermissionGuard permissions={[Permission.PROJECT_READ]}>
      <PageLayout>
        <header className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
                案件一覧
              </h1>
              <p className="text-sub">
                {projects.length}件の案件が登録されています
              </p>
            </div>
            
            <SalesOrHigher>
              <Link href="/projects/new">
                <Button>新規登録</Button>
              </Link>
            </SalesOrHigher>
          </div>
        </header>

        {projects.length === 0 ? (
          <EmptyStateCard
            icon="📁"
            title="案件が登録されていません"
            description="まだ案件が登録されていません。新しい案件を登録してください。"
            action={
              <SalesOrHigher>
                <Link href="/projects/new">
                  <Button size="lg">最初の案件を登録</Button>
                </Link>
              </SalesOrHigher>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </PageLayout>
    </PermissionGuard>
  );
} 
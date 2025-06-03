import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ProjectListItem } from "@/lib/types/project";
import { ProjectCard } from "./components/ProjectCard";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Button } from "@/components/ui/Button";
import { EmptyStateCard } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "案件一覧 | SES管理システム",
  description: "SES管理システムの案件一覧ページです。案件の詳細、期間、単価などを確認できます。",
};

async function fetchProjects(): Promise<ProjectListItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/projects`, { 
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

export default async function ProjectsPage() {
  let projects: ProjectListItem[] = [];
  let error: string | null = null;

  try {
    projects = await fetchProjects();
  } catch (e) {
    error = e instanceof Error ? e.message : "案件データの取得に失敗しました";
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-6xl">
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
            
            <Link href="/projects/new">
              <Button>新規登録</Button>
            </Link>
          </div>
        </header>

        {projects.length === 0 ? (
          <EmptyStateCard
            icon="📁"
            title="案件が登録されていません"
            description="まだ案件が登録されていません。新しい案件を登録してください。"
            action={
              <Link href="/projects/new">
                <Button size="lg">最初の案件を登録</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 
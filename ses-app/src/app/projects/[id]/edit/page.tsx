import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Project } from "@/lib/types/project";
import { ProjectForm } from "../../components/ProjectForm";
import { ErrorDisplay } from "../../components/ErrorBoundary";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const project = await fetchProject(id);
    return {
      title: `${project.title}を編集 | SES管理システム`,
      description: `案件「${project.title}」の編集ページです。`,
    };
  } catch {
    return {
      title: "案件編集 | SES管理システム",
      description: "案件の情報を編集できます。",
    };
  }
}

async function fetchProject(id: string): Promise<Project> {
  try {
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      notFound();
    }
    
    return {
      ...project,
      periodStart: project.periodStart.toISOString().split('T')[0],
      periodEnd: project.periodEnd.toISOString().split('T')[0],
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      publishedAt: project.publishedAt?.toISOString() || null,
      lastContactedAt: project.lastContactedAt?.toISOString() || null,
    } as Project;
  } catch (error) {
    console.error("案件データ取得エラー:", error);
    throw new Error("案件データの取得に失敗しました");
  }
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  
  let project: Project;
  let error: string | null = null;

  try {
    project = await fetchProject(id);
  } catch (e) {
    error = e instanceof Error ? e.message : "案件データの取得に失敗しました";
    return <ErrorDisplay message={error} />;
  }

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
            案件編集
          </h1>
          <p className="text-sub">
            「{project.title}」の情報を編集します。
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <ProjectForm mode="edit" initialData={project} />
        </div>
      </div>
    </main>
  );
} 
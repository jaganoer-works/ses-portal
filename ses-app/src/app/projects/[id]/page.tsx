import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Project } from "@/lib/types/project";
import { ErrorDisplay } from "../components/ErrorBoundary";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const project = await fetchProject(id);
    return {
      title: `${project.title} | SES管理システム`,
      description: project.description || `案件「${project.title}」の詳細ページです。`,
    };
  } catch {
    return {
      title: "案件詳細 | SES管理システム",
      description: "案件の詳細情報を確認できます。",
    };
  }
}

async function fetchProject(id: string): Promise<Project> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/projects/${id}`, { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        notFound();
      }
      throw new Error(`HTTP ${res.status}: 案件データの取得に失敗しました`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("案件データ取得エラー:", error);
    throw error;
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  
  let project: Project;
  let error: string | null = null;

  try {
    project = await fetchProject(id);
  } catch (e) {
    error = e instanceof Error ? e.message : "案件データの取得に失敗しました";
    return <ErrorDisplay message={error} />;
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return "要相談";
    return `${price.toLocaleString()}円`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "未設定";
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "募集中": { bgColor: "bg-green-100", textColor: "text-green-800", label: "募集中" },
      "進行中": { bgColor: "bg-blue-100", textColor: "text-blue-800", label: "進行中" },
      "完了": { bgColor: "bg-gray-100", textColor: "text-gray-800", label: "完了" },
      "停止": { bgColor: "bg-red-100", textColor: "text-red-800", label: "停止" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { bgColor: "bg-gray-100", textColor: "text-gray-800", label: status };
    
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  const getPublishedBadge = (published: boolean) => {
    return published ? (
      <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
        公開中
      </span>
    ) : (
      <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
        非公開
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
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
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-accent mb-4">
                {project.title}
              </h1>
              <div className="flex gap-3">
                {getStatusBadge(project.status)}
                {getPublishedBadge(project.published)}
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <Link
                href={`/projects/${project.id}/edit`}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                編集
              </Link>
            </div>
          </div>
        </header>

        {/* メイン情報 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 基本情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報カード */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">単価</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {formatPrice(project.price)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">期間</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(project.periodStart)} 〜 {formatDate(project.periodEnd)}
                  </dd>
                </div>
              </div>
            </div>

            {/* 詳細説明カード */}
            {project.description && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">詳細説明</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </div>
            )}

            {/* やりとり履歴カード */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">やりとり履歴</h2>
              
              {project.interactions && project.interactions.length > 0 ? (
                <div className="space-y-4">
                  {project.interactions.map((interaction) => (
                    <div key={interaction.id} className="border-l-4 border-accent pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          進捗: {interaction.progress}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(interaction.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {interaction.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">まだやりとりがありません。</p>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href={`/interactions?project=${project.id}`}
                  className="text-accent hover:text-accent-dark font-medium text-sm transition-colors"
                >
                  やりとりを管理 →
                </Link>
              </div>
            </div>
          </div>

          {/* 右カラム: サイドバー */}
          <div className="space-y-6">
            {/* メタ情報カード */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">メタ情報</h3>
              
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-500">作成日時</dt>
                  <dd className="text-sm text-gray-900">{formatDateTime(project.createdAt)}</dd>
                </div>
                
                <div>
                  <dt className="text-xs font-medium text-gray-500">更新日時</dt>
                  <dd className="text-sm text-gray-900">{formatDateTime(project.updatedAt)}</dd>
                </div>
                
                {project.publishedAt && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">公開日時</dt>
                    <dd className="text-sm text-gray-900">{formatDateTime(project.publishedAt)}</dd>
                  </div>
                )}
                
                {project.lastContactedAt && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">最終連絡日時</dt>
                    <dd className="text-sm text-gray-900">{formatDateTime(project.lastContactedAt)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* アクションカード */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              
              <div className="space-y-3">
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="block w-full px-4 py-2 bg-accent text-white text-center rounded-md hover:bg-accent-dark transition-colors"
                >
                  案件を編集
                </Link>
                
                <Link
                  href={`/interactions?project=${project.id}`}
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-md hover:bg-gray-200 transition-colors"
                >
                  やりとりを見る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
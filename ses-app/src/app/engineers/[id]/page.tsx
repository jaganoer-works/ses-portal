import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Engineer } from "@/lib/types/user";
import { apiFetch } from "@/lib/api/fetchService";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const engineer = await fetchEngineer(id);
  return {
    title: engineer ? `${engineer.name} | 技術者詳細` : "技術者詳細",
    description: engineer ? `${engineer.name}さんの詳細情報` : "技術者の詳細情報",
  };
}

async function fetchEngineer(id: string): Promise<Engineer | null> {
  return apiFetch<Engineer>(`/api/engineers/${id}`);
}

export default async function EngineerDetailPage({ params }: Props) {
  const { id } = await params;
  const engineer = await fetchEngineer(id);
  
  if (!engineer) {
    return notFound();
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('ja-JP');
    } catch {
      return dateString.slice(0, 10);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "-";
    return `${price.toLocaleString()}円`;
  };

  const skillNames = engineer.skills.map(s => s.skill.name).join(", ") || "-";

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8">
          <nav className="mb-4">
            <Link 
              href="/engineers" 
              className="text-accent hover:text-accent-dark transition-colors"
            >
              ← 技術者一覧に戻る
            </Link>
          </nav>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
                技術者詳細
              </h1>
              <p className="text-sub">
                {engineer.name}さんの詳細情報
              </p>
            </div>
            
            <Link
              href={`/engineers/${id}/edit`}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              編集
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 基本情報 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-accent-dark mb-4">基本情報</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">名前</dt>
                  <dd className="text-lg font-semibold text-accent-dark">{engineer.name}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                  <dd className="text-sm text-main">
                    <a href={`mailto:${engineer.email}`} className="text-accent hover:text-accent-dark">
                      {engineer.email}
                    </a>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">希望単価</dt>
                  <dd className="text-lg font-semibold text-accent-dark">
                    {formatPrice(engineer.desiredPrice)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">稼働開始日</dt>
                  <dd className="text-sm text-main">
                    {formatDate(engineer.availableFrom)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">役割</dt>
                  <dd className="text-sm text-main">{engineer.role}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">稼働可能</dt>
                  <dd className="text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      engineer.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {engineer.isAvailable ? '可能' : '不可'}
                    </span>
                  </dd>
                </div>
              </div>
            </div>

            {/* スキル */}
            <div className="bg-card border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-accent-dark mb-4">スキル</h2>
              
              {engineer.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {engineer.skills.map((skillItem, index) => (
                    <span
                      key={index}
                      className="inline-flex px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
                    >
                      {skillItem.skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">スキルが登録されていません</p>
              )}
            </div>

            {/* 詳細・備考 */}
            {engineer.description && (
              <div className="bg-card border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-accent-dark mb-4">詳細・備考</h2>
                <p className="text-sm text-main whitespace-pre-wrap">{engineer.description}</p>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            <div className="bg-card border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-accent-dark mb-4">ステータス</h3>
              
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">現在のステータス</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      engineer.status === '稼働中' ? 'bg-green-100 text-green-800' :
                      engineer.status === '待機中' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {engineer.status}
                    </span>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">登録日</dt>
                  <dd className="text-sm text-main">
                    {formatDate(engineer.createdAt)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">最終更新</dt>
                  <dd className="text-sm text-main">
                    {formatDate(engineer.updatedAt)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
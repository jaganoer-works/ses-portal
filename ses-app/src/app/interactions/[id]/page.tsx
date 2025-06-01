import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchInteraction } from "@/lib/api/interactions";
import { InteractionDetailClient } from "./InteractionDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InteractionDetailPage({ params }: Props) {
  const { id } = await params;

  let interaction;
  try {
    interaction = await fetchInteraction(id);
  } catch (error) {
    console.error("やりとり詳細取得エラー:", error);
    notFound();
  }

  // 日時フォーマット
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 進捗ステータスのバッジ
  const getProgressBadge = (progress: string) => {
    const statusStyles: { [key: string]: string } = {
      "面談調整中": "bg-yellow-100 text-yellow-800",
      "書類選考中": "bg-blue-100 text-blue-800", 
      "アサイン済み": "bg-green-100 text-green-800",
      "管理対応": "bg-purple-100 text-purple-800",
    };

    const style = statusStyles[progress] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${style}`}>
        {progress}
      </span>
    );
  };

  // 既読・未読のバッジ
  const getReadStatusBadge = (isRead: boolean) => {
    return isRead ? (
      <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
        既読
      </span>
    ) : (
      <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
        未読
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
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
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-accent mb-4">
                やりとり詳細
              </h1>
              <div className="flex gap-3">
                {getReadStatusBadge(interaction.isRead)}
                {interaction.progress && getProgressBadge(interaction.progress)}
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <Link
                href={`/interactions/${interaction.id}/edit`}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                編集
              </Link>
            </div>
          </div>
        </header>

        {/* メイン情報 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: メッセージ内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* メッセージカード */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">メッセージ内容</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {interaction.message}
                </p>
              </div>
            </div>

            {/* 関連案件情報 */}
            {interaction.project && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">関連案件</h2>
                <div className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">案件名</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      <Link
                        href={`/projects/${interaction.project.id}`}
                        className="text-accent hover:text-accent-dark transition-colors"
                      >
                        {interaction.project.title}
                      </Link>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                    <dd className="text-sm text-gray-900">{interaction.project.status}</dd>
                  </div>

                  {interaction.project.description && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">案件詳細</dt>
                      <dd className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                        {interaction.project.description}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右カラム: サイドバー */}
          <div className="space-y-6">
            {/* メタ情報カード */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">詳細情報</h3>
              
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-500">作成日時</dt>
                  <dd className="text-sm text-gray-900">{formatDateTime(interaction.createdAt)}</dd>
                </div>
                
                <div>
                  <dt className="text-xs font-medium text-gray-500">更新日時</dt>
                  <dd className="text-sm text-gray-900">{formatDateTime(interaction.updatedAt)}</dd>
                </div>
                
                <div>
                  <dt className="text-xs font-medium text-gray-500">技術者ID</dt>
                  <dd className="text-sm text-gray-900">{interaction.engineerId}</dd>
                </div>

                {interaction.readAt && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">既読日時</dt>
                    <dd className="text-sm text-gray-900">{formatDateTime(interaction.readAt)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* アクションカード */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              
              <InteractionDetailClient interaction={interaction} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
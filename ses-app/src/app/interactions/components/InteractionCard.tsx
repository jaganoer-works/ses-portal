"use client";

import { useState } from "react";
import Link from "next/link";
import { Interaction } from "@/lib/types/project";
import { deleteInteraction, markAsRead } from "@/lib/api/interactions";

interface InteractionCardProps {
  interaction: Interaction & { 
    project?: { 
      id: string; 
      title: string; 
      status: string; 
    } 
  };
  onDeleted: (id: string) => void;
}

export function InteractionCard({ interaction, onDeleted }: InteractionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

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

  // 削除処理
  const handleDelete = async () => {
    if (!confirm("このやりとりを削除してもよろしいですか？")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteInteraction(interaction.id);
      onDeleted(interaction.id);
    } catch (error) {
      alert("削除に失敗しました。");
      console.error("削除エラー:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // 既読処理
  const handleMarkAsRead = async () => {
    if (interaction.isRead) return;

    try {
      setIsMarkingRead(true);
      await markAsRead(interaction.id);
      // 成功時は親コンポーネントで再取得される
    } catch (error) {
      alert("既読更新に失敗しました。");
      console.error("既読更新エラー:", error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  // 既読・未読のスタイル
  const getReadStatusStyle = () => {
    return interaction.isRead 
      ? "bg-white border-gray-200" 
      : "bg-blue-50 border-blue-200 shadow-md";
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
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${style}`}>
        {progress}
      </span>
    );
  };

  return (
    <div className={`rounded-lg border transition-shadow duration-200 hover:shadow-lg ${getReadStatusStyle()}`}>
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {!interaction.isRead && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
              <span className="text-sm font-medium text-gray-500">
                {formatDateTime(interaction.createdAt)}
              </span>
              {interaction.progress && getProgressBadge(interaction.progress)}
            </div>
            
            {/* 案件情報 */}
            {interaction.project && (
              <div className="mb-2">
                <Link
                  href={`/projects/${interaction.project.id}`}
                  className="text-sm text-accent hover:text-accent-dark font-medium transition-colors"
                >
                  案件: {interaction.project.title}
                </Link>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 ml-4">
            {!interaction.isRead && (
              <button
                onClick={handleMarkAsRead}
                disabled={isMarkingRead}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {isMarkingRead ? "処理中..." : "既読にする"}
              </button>
            )}
            
            <Link
              href={`/interactions/${interaction.id}`}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              詳細
            </Link>
            
            <Link
              href={`/interactions/${interaction.id}/edit`}
              className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent-dark transition-colors"
            >
              編集
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
          </div>
        </div>

        {/* メッセージ内容 */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-3">
            {interaction.message}
          </p>
        </div>

        {/* フッター */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>技術者ID: {interaction.engineerId}</span>
          {interaction.readAt && (
            <span>既読: {formatDateTime(interaction.readAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
} 
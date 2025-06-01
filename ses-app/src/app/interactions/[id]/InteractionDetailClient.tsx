"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Interaction } from "@/lib/types/project";
import { markAsRead, deleteInteraction } from "@/lib/api/interactions";

interface InteractionDetailClientProps {
  interaction: Interaction;
}

export function InteractionDetailClient({ interaction }: InteractionDetailClientProps) {
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // 既読処理
  const handleMarkAsRead = async () => {
    if (interaction.isRead) return;

    try {
      setIsMarkingRead(true);
      await markAsRead(interaction.id);
      router.refresh(); // ページを再読み込みして最新状態を反映
    } catch (error) {
      alert("既読更新に失敗しました。");
      console.error("既読更新エラー:", error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!confirm("このやりとりを削除してもよろしいですか？")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteInteraction(interaction.id);
      router.push("/interactions"); // 一覧ページに戻る
    } catch (error) {
      alert("削除に失敗しました。");
      console.error("削除エラー:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 既読ボタン */}
      {!interaction.isRead && (
        <button
          onClick={handleMarkAsRead}
          disabled={isMarkingRead}
          className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isMarkingRead ? "既読更新中..." : "既読にする"}
        </button>
      )}

      {/* 編集ボタン */}
      <Link
        href={`/interactions/${interaction.id}/edit`}
        className="block w-full px-4 py-2 bg-accent text-white text-center rounded-md hover:bg-accent-dark transition-colors"
      >
        やりとりを編集
      </Link>

      {/* 関連案件表示ボタン */}
      {interaction.projectId && (
        <Link
          href={`/projects/${interaction.projectId}`}
          className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-md hover:bg-gray-200 transition-colors"
        >
          関連案件を表示
        </Link>
      )}

      {/* 削除ボタン */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="block w-full px-4 py-2 bg-red-600 text-white text-center rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {isDeleting ? "削除中..." : "やりとりを削除"}
      </button>
    </div>
  );
} 
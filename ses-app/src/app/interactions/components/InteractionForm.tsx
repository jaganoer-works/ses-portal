"use client";

import { useState, useEffect } from "react";
import { CreateInteractionData, UpdateInteractionData } from "@/lib/api/interactions";

interface InteractionFormProps {
  mode: "create" | "edit";
  projects: Array<{id: string, title: string}>;
  engineers: Array<{id: string, name: string}>;
  initialData: {
    projectId: string;
    engineerId: string;
    message: string;
    progress: string;
  };
  onSubmit: (data: CreateInteractionData | UpdateInteractionData) => Promise<void>;
  loading: boolean;
}

export function InteractionForm({ 
  mode, 
  projects, 
  engineers, 
  initialData, 
  onSubmit, 
  loading 
}: InteractionFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // initialDataの変更を反映
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // フォームバリデーション
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (mode === "create") {
      if (!formData.projectId) {
        newErrors.projectId = "案件を選択してください";
      }
      if (!formData.engineerId) {
        newErrors.engineerId = "技術者を選択してください";
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = "メッセージを入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = mode === "create" 
        ? {
            projectId: formData.projectId,
            engineerId: formData.engineerId,
            message: formData.message,
            progress: formData.progress || undefined,
          }
        : {
            message: formData.message,
            progress: formData.progress || undefined,
          };

      await onSubmit(submitData);
    } catch (error) {
      console.error("フォーム送信エラー:", error);
    }
  };

  // フィールド更新
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // 選択された案件・技術者の名前を取得
  const getProjectTitle = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || "";
  };

  const getEngineerName = (engineerId: string) => {
    const engineer = engineers.find(e => e.id === engineerId);
    return engineer?.name || "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 案件選択 */}
      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
          案件 <span className="text-red-500">*</span>
        </label>
        {mode === "edit" ? (
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
            {getProjectTitle(formData.projectId) || "案件情報が見つかりません"}
          </div>
        ) : (
          <select
            id="projectId"
            value={formData.projectId}
            onChange={(e) => updateField("projectId", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
              errors.projectId ? "border-red-500" : "border-gray-300"
            }`}
            disabled={loading}
          >
            <option value="">案件を選択してください</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        )}
        {errors.projectId && (
          <p className="mt-1 text-sm text-red-500">{errors.projectId}</p>
        )}
      </div>

      {/* 技術者選択 */}
      <div>
        <label htmlFor="engineerId" className="block text-sm font-medium text-gray-700 mb-2">
          技術者 <span className="text-red-500">*</span>
        </label>
        {mode === "edit" ? (
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
            {getEngineerName(formData.engineerId) || "技術者情報が見つかりません"}
          </div>
        ) : (
          <select
            id="engineerId"
            value={formData.engineerId}
            onChange={(e) => updateField("engineerId", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
              errors.engineerId ? "border-red-500" : "border-gray-300"
            }`}
            disabled={loading}
          >
            <option value="">技術者を選択してください</option>
            {engineers.map((engineer) => (
              <option key={engineer.id} value={engineer.id}>
                {engineer.name}
              </option>
            ))}
          </select>
        )}
        {errors.engineerId && (
          <p className="mt-1 text-sm text-red-500">{errors.engineerId}</p>
        )}
      </div>

      {/* メッセージ */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          メッセージ <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
            errors.message ? "border-red-500" : "border-gray-300"
          }`}
          rows={6}
          placeholder="やりとりの内容を入力してください"
          disabled={loading}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message}</p>
        )}
      </div>

      {/* 進捗 */}
      <div>
        <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-2">
          進捗
        </label>
        <select
          id="progress"
          value={formData.progress}
          onChange={(e) => updateField("progress", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          disabled={loading}
        >
          <option value="">進捗を選択してください</option>
          <option value="面談調整中">面談調整中</option>
          <option value="書類選考中">書類選考中</option>
          <option value="アサイン済み">アサイン済み</option>
          <option value="管理対応">管理対応</option>
        </select>
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (mode === "create" ? "作成中..." : "更新中...") : (mode === "create" ? "作成" : "更新")}
        </button>
        
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={loading}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
} 
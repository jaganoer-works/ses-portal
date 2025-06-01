"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project, ProjectFormData } from "@/lib/types/project";

type ProjectFormProps = {
  mode: "create" | "edit";
  initialData?: Project;
};

const initialFormData: ProjectFormData = {
  title: "",
  price: 0,
  periodStart: "",
  periodEnd: "",
  description: "",
  status: "募集中",
  published: false,
};

const statusOptions = [
  { value: "募集中", label: "募集中" },
  { value: "進行中", label: "進行中" },
  { value: "完了", label: "完了" },
  { value: "停止", label: "停止" },
];

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編集モードの場合、初期データを設定
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title,
        price: initialData.price || 0,
        periodStart: initialData.periodStart.split('T')[0], // YYYY-MM-DD形式に変換
        periodEnd: initialData.periodEnd.split('T')[0],
        description: initialData.description || "",
        status: initialData.status,
        published: initialData.published,
      });
    }
  }, [mode, initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        periodStart: new Date(formData.periodStart).toISOString(),
        periodEnd: new Date(formData.periodEnd).toISOString(),
      };

      const url = mode === "create" 
        ? "/api/projects" 
        : `/api/projects/${initialData?.id}`;
      
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 案件の${mode === "create" ? "作成" : "更新"}に失敗しました`);
      }

      const result = await response.json();
      
      // 成功時は詳細ページまたは一覧ページにリダイレクト
      if (mode === "create") {
        router.push(`/projects/${result.id}`);
      } else {
        router.push(`/projects/${result.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForInput = (dateString: string) => {
    return dateString.split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800">
              <strong>エラー:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* 案件タイトル */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          案件タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
          placeholder="案件のタイトルを入力してください"
        />
      </div>

      {/* 単価 */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
          単価（円）
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          min="0"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
          placeholder="0"
        />
      </div>

      {/* 期間 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="periodStart" className="block text-sm font-medium text-gray-700 mb-2">
            開始日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="periodStart"
            name="periodStart"
            value={formData.periodStart}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
          />
        </div>
        
        <div>
          <label htmlFor="periodEnd" className="block text-sm font-medium text-gray-700 mb-2">
            終了日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="periodEnd"
            name="periodEnd"
            value={formData.periodEnd}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
          />
        </div>
      </div>

      {/* ステータス */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          ステータス <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 公開設定 */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="published"
            checked={formData.published}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-accent focus:ring-accent"
          />
          <span className="ml-2 text-sm text-gray-700">この案件を公開する</span>
        </label>
      </div>

      {/* 詳細説明 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          詳細説明
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
          placeholder="案件の詳細な説明を入力してください"
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (mode === "create" ? "登録中..." : "更新中...") 
            : (mode === "create" ? "案件を登録" : "案件を更新")
          }
        </button>
        
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
} 
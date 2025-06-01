"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Engineer } from "@/lib/types/user";

type EngineerFormData = {
  name: string;
  email: string;
  desiredPrice: string;
  availableFrom: string;
  description: string;
  status: string;
  role: string;
  isAvailable: boolean;
  skills: string[];
};

type EngineerFormProps = {
  initialData?: Partial<Engineer>;
  mode: "create" | "edit";
  engineerId?: string;
};

const STATUS_OPTIONS = [
  { value: "待機中", label: "待機中" },
  { value: "稼働中", label: "稼働中" },
  { value: "休止中", label: "休止中" },
];

const ROLE_OPTIONS = [
  { value: "フロントエンド", label: "フロントエンド" },
  { value: "バックエンド", label: "バックエンド" },
  { value: "フルスタック", label: "フルスタック" },
  { value: "インフラ", label: "インフラ" },
  { value: "データベース", label: "データベース" },
  { value: "PM/PL", label: "PM/PL" },
];

export function EngineerForm({ initialData, mode, engineerId }: EngineerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EngineerFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    desiredPrice: initialData?.desiredPrice ? String(initialData.desiredPrice) : "",
    availableFrom: initialData?.availableFrom?.split('T')[0] || "",
    description: initialData?.description || "",
    status: initialData?.status || "待機中",
    role: initialData?.role || "フルスタック",
    isAvailable: initialData?.isAvailable ?? true,
    skills: initialData?.skills?.map(s => s.skill.name) || [],
  });

  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = mode === "create" 
        ? "/api/users" 
        : `/api/users/${engineerId}`;
      
      const method = mode === "create" ? "POST" : "PUT";

      const payload = {
        ...formData,
        desiredPrice: parseInt(formData.desiredPrice) || 0,
        availableFrom: new Date(formData.availableFrom).toISOString(),
        createdBy: mode === "create" ? "system" : undefined,
        updatedBy: mode === "edit" ? "system" : undefined,
      };

      console.log("送信データ:", payload);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("APIエラーレスポンス:", errorData);
        
        let errorMessage = "送信に失敗しました";
        if (errorData.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.map((err: any) => `${err.field}: ${err.message}`).join(", ");
          } else {
            errorMessage = errorData.message;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("作成/更新結果:", result);

      router.push("/engineers");
      router.refresh();
    } catch (err) {
      console.error("送信エラー:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 基本情報 */}
      <div className="bg-card rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-accent-dark mb-4">基本情報</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              希望単価 (円) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.desiredPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, desiredPrice: e.target.value }))}
              placeholder="例: 500000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              稼働開始日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.availableFrom}
              onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              役割 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              {ROLE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
              className="mr-2 h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">稼働可能</span>
          </label>
        </div>
      </div>

      {/* スキル */}
      <div className="bg-card rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-accent-dark mb-4">スキル</h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="スキルを入力"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
          >
            追加
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-gray-500 hover:text-red-500 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="bg-card rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-accent-dark mb-4">詳細情報</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            詳細・備考
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            placeholder="技術者の詳細情報や備考を入力してください"
          />
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "送信中..." : mode === "create" ? "登録" : "更新"}
        </button>
      </div>
    </form>
  );
} 
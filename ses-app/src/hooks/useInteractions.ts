import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Interaction } from "@/lib/types/project";
import { fetchInteractions, InteractionFilter } from "@/lib/api/interactions";

export interface UseInteractionsOptions {
  autoLoad?: boolean;
  initialFilter?: InteractionFilter;
}

export interface UseInteractionsReturn {
  interactions: Interaction[];
  filteredInteractions: Interaction[];
  loading: boolean;
  error: string | null;
  filter: InteractionFilter;
  searchQuery: string;
  totalCount: number;
  unreadCount: number;
  setFilter: (filter: InteractionFilter) => void;
  setSearchQuery: (query: string) => void;
  loadInteractions: () => Promise<void>;
  addInteraction: (interaction: Interaction) => void;
  updateInteraction: (id: string, updates: Partial<Interaction>) => void;
  removeInteraction: (id: string) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  clearError: () => void;
  refresh: () => Promise<void>;
}

export function useInteractions({
  autoLoad = true,
  initialFilter = {},
}: UseInteractionsOptions = {}): UseInteractionsReturn {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InteractionFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  
  const searchParams = useSearchParams();

  // URLパラメータから初期フィルタを設定
  useEffect(() => {
    const projectId = searchParams.get("project");
    const engineerId = searchParams.get("engineer");
    const isReadParam = searchParams.get("isRead");

    const urlFilter: InteractionFilter = { ...initialFilter };
    if (projectId) urlFilter.project = projectId;
    if (engineerId) urlFilter.engineer = engineerId;
    if (isReadParam !== null) urlFilter.isRead = isReadParam === "true";

    setFilter(urlFilter);
  }, [searchParams, initialFilter]);

  // やりとりの読み込み
  const loadInteractions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInteractions(filter);
      setInteractions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "やりとりデータの取得に失敗しました";
      setError(message);
      console.error("Interactions loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // 初回読み込み
  useEffect(() => {
    if (autoLoad) {
      loadInteractions();
    }
  }, [autoLoad, loadInteractions]);

  // フィルタリングと検索の適用
  const filteredInteractions = useMemo(() => {
    let filtered = [...interactions];

    // 検索クエリでフィルタリング（メッセージ内容のみ）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(interaction =>
        interaction.message.toLowerCase().includes(query)
        // TODO: プロジェクトや技術者の名前での検索には関連データが必要
        // interaction.project.title.toLowerCase().includes(query) ||
        // interaction.engineer.name.toLowerCase().includes(query)
      );
    }

    // ソート（作成日時の降順）
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  }, [interactions, searchQuery]);

  // 統計情報
  const totalCount = interactions.length;
  const unreadCount = interactions.filter(interaction => !interaction.isRead).length;

  // やりとりの追加
  const addInteraction = useCallback((interaction: Interaction) => {
    setInteractions(prev => [interaction, ...prev]);
  }, []);

  // やりとりの更新
  const updateInteraction = useCallback((id: string, updates: Partial<Interaction>) => {
    setInteractions(prev =>
      prev.map(interaction =>
        interaction.id === id ? { ...interaction, ...updates } : interaction
      )
    );
  }, []);

  // やりとりの削除
  const removeInteraction = useCallback((id: string) => {
    setInteractions(prev => prev.filter(interaction => interaction.id !== id));
  }, []);

  // 既読マーク
  const markAsRead = useCallback((id: string) => {
    updateInteraction(id, { isRead: true });
  }, [updateInteraction]);

  // 未読マーク
  const markAsUnread = useCallback((id: string) => {
    updateInteraction(id, { isRead: false });
  }, [updateInteraction]);

  // エラークリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // リフレッシュ
  const refresh = useCallback(async () => {
    await loadInteractions();
  }, [loadInteractions]);

  return {
    interactions,
    filteredInteractions,
    loading,
    error,
    filter,
    searchQuery,
    totalCount,
    unreadCount,
    setFilter,
    setSearchQuery,
    loadInteractions,
    addInteraction,
    updateInteraction,
    removeInteraction,
    markAsRead,
    markAsUnread,
    clearError,
    refresh,
  };
}

// やりとり作成用のフック
export function useCreateInteraction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInteraction = useCallback(async (data: {
    projectId: string;
    engineerId: string;
    message: string;
    progress: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: やりとりの作成に失敗しました`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "やりとりの作成に失敗しました";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createInteraction,
    loading,
    error,
    clearError,
  };
}

// やりとり削除用のフック
export function useDeleteInteraction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteInteraction = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/interactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: やりとりの削除に失敗しました`);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "やりとりの削除に失敗しました";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deleteInteraction,
    loading,
    error,
    clearError,
  };
} 
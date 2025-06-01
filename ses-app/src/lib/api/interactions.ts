// やりとり管理用APIクライアント関数

import { Interaction } from "@/lib/types/project";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export interface InteractionFilter {
  project?: string;
  engineer?: string;
  isRead?: boolean;
}

export interface CreateInteractionData {
  projectId: string;
  engineerId: string;
  message: string;
  progress?: string;
}

export interface UpdateInteractionData {
  message?: string;
  progress?: string;
  isRead?: boolean;
  readAt?: string;
}

// やりとり一覧取得
export async function fetchInteractions(filter?: InteractionFilter): Promise<Interaction[]> {
  try {
    const params = new URLSearchParams();
    if (filter?.project) params.append("project", filter.project);
    if (filter?.engineer) params.append("engineer", filter.engineer);
    if (filter?.isRead !== undefined) params.append("isRead", filter.isRead.toString());

    const url = `${BASE_URL}/api/interactions${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`やりとり一覧の取得に失敗しました: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("やりとり一覧取得エラー:", error);
    throw error;
  }
}

// やりとり詳細取得
export async function fetchInteraction(id: string): Promise<Interaction> {
  try {
    const response = await fetch(`${BASE_URL}/api/interactions/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`やりとり詳細の取得に失敗しました: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("やりとり詳細取得エラー:", error);
    throw error;
  }
}

// やりとり新規作成
export async function createInteraction(data: CreateInteractionData): Promise<Interaction> {
  try {
    const response = await fetch(`${BASE_URL}/api/interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `やりとりの作成に失敗しました: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("やりとり作成エラー:", error);
    throw error;
  }
}

// やりとり更新
export async function updateInteraction(id: string, data: UpdateInteractionData): Promise<Interaction> {
  try {
    const response = await fetch(`${BASE_URL}/api/interactions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `やりとりの更新に失敗しました: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("やりとり更新エラー:", error);
    throw error;
  }
}

// やりとり削除
export async function deleteInteraction(id: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${BASE_URL}/api/interactions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `やりとりの削除に失敗しました: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("やりとり削除エラー:", error);
    throw error;
  }
}

// 既読ステータス更新
export async function markAsRead(id: string): Promise<Interaction> {
  return updateInteraction(id, {
    isRead: true,
    readAt: new Date().toISOString(),
  });
} 
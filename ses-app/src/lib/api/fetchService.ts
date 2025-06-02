/**
 * API呼び出し時の共通設定
 */
export const defaultFetchOptions = {
  cache: "no-store" as const,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * ベースURLを取得
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

/**
 * 共通のAPIフェッチ関数
 */
export async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T | null> {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...defaultFetchOptions,
      ...options,
    });
    
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error(`API呼び出しエラー (${endpoint}):`, error);
    return null;
  }
}

/**
 * 共通のAPIフェッチ関数（エラーハンドリング付き）
 */
export async function apiFetchWithError<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...defaultFetchOptions,
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: データの取得に失敗しました`);
  }
  
  return response.json();
} 
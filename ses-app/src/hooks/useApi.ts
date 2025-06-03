import { useState, useCallback } from "react";

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiOptions {
  initialData?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<UseApiState<T>>({
    data: options.initialData || null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "エラーが発生しました";
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      data: options.initialData || null,
      loading: false,
      error: null,
    });
  }, [options.initialData]);

  const retry = useCallback((apiCall: () => Promise<T>) => {
    return execute(apiCall);
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
    setState,
  };
}

// 特定のAPIエンドポイント用のフック
export function useApiCall<T = any>(
  url: string,
  options: UseApiOptions & {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const { method = "GET", body, headers = {}, ...apiOptions } = options;
  const api = useApi<T>(apiOptions);

  const call = useCallback(async (overrideBody?: any) => {
    const apiCall = async () => {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: overrideBody ? JSON.stringify(overrideBody) : body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: API呼び出しに失敗しました`);
      }

      return response.json();
    };

    return api.execute(apiCall);
  }, [url, method, body, headers, api]);

  return {
    ...api,
    call,
  };
}

// リスト取得用のフック
export function useApiList<T = any>(url: string, options: UseApiOptions = {}) {
  const api = useApi<T[]>({ initialData: [], ...options });

  const fetchList = useCallback(async (filters?: Record<string, any>) => {
    const apiCall = async () => {
      const queryParams = filters ? new URLSearchParams(filters).toString() : "";
      const fullUrl = queryParams ? `${url}?${queryParams}` : url;
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: データの取得に失敗しました`);
      }
      return response.json();
    };

    return api.execute(apiCall);
  }, [url, api]);

  const addItem = useCallback((item: T) => {
    api.setState(prev => ({
      ...prev,
      data: prev.data ? [...prev.data, item] : [item],
    }));
  }, [api]);

  const updateItem = useCallback((id: string, updatedItem: T) => {
    api.setState(prev => ({
      ...prev,
      data: prev.data ? prev.data.map(item => 
        (item as any).id === id ? updatedItem : item
      ) : null,
    }));
  }, [api]);

  const removeItem = useCallback((id: string) => {
    api.setState(prev => ({
      ...prev,
      data: prev.data ? prev.data.filter(item => (item as any).id !== id) : null,
    }));
  }, [api]);

  return {
    ...api,
    fetchList,
    addItem,
    updateItem,
    removeItem,
  };
}

// フォーム送信用のフック
export function useApiSubmit<T = any>(
  url: string,
  method: "POST" | "PUT" | "DELETE" = "POST",
  options: UseApiOptions = {}
) {
  const api = useApi<T>(options);

  const submit = useCallback(async (data: any) => {
    const apiCall = async () => {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 送信に失敗しました`);
      }

      return method === "DELETE" ? null : response.json();
    };

    return api.execute(apiCall);
  }, [url, method, api]);

  return {
    ...api,
    submit,
  };
} 
import React from "react";
import { Button } from "./Button";

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
  variant?: "page" | "inline" | "card";
  className?: string;
}

export function ErrorDisplay({
  title = "エラーが発生しました",
  message,
  onRetry,
  retryText = "再試行",
  showIcon = true,
  variant = "page",
  className = "",
}: ErrorDisplayProps) {
  const iconElement = showIcon && (
    <div className="text-red-500 mb-4">
      <svg
        className="mx-auto h-12 w-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
  );

  const contentElement = (
    <>
      {iconElement}
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sub mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          {retryText}
        </Button>
      )}
    </>
  );

  if (variant === "page") {
    return (
      <main className={`min-h-screen bg-base py-8 px-4 ${className}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            {contentElement}
          </div>
        </div>
      </main>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-white border border-red-200 rounded-lg p-6 text-center ${className}`}>
        {contentElement}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <div className="mt-2 text-sm text-red-700">{message}</div>
            {onRetry && (
              <div className="mt-3">
                <Button onClick={onRetry} variant="outline" size="sm">
                  {retryText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// 特定用途のエラーコンポーネント
export function NotFoundError({ 
  resource = "ページ",
  backUrl,
  backText = "戻る"
}: { 
  resource?: string;
  backUrl?: string;
  backText?: string;
}) {
  return (
    <ErrorDisplay
      title={`${resource}が見つかりません`}
      message={`お探しの${resource}は削除されているか、URLが間違っている可能性があります。`}
      onRetry={backUrl ? () => window.location.href = backUrl : undefined}
      retryText={backText}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="通信エラー"
      message="サーバーとの通信に失敗しました。インターネット接続を確認して、もう一度お試しください。"
      onRetry={onRetry}
      retryText="再試行"
    />
  );
} 
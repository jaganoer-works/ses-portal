import React from "react";

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  variant?: "spinner" | "pulse" | "dots";
}

export function Loading({ 
  size = "md", 
  text = "読み込み中...", 
  className = "",
  variant = "spinner"
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "spinner") {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <svg
          className={`animate-spin ${sizeClasses[size]} text-accent`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && (
          <p className={`text-sub ${textSizeClasses[size]}`}>{text}</p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2 mt-2">
            <div className="h-3 bg-gray-100 rounded"></div>
            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && (
          <p className={`text-sub ml-2 ${textSizeClasses[size]}`}>{text}</p>
        )}
      </div>
    );
  }

  return null;
}

// ページ全体用のローディングコンポーネント
export function PageLoading({ text = "読み込み中..." }: { text?: string }) {
  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center py-12">
          <Loading size="lg" text={text} />
        </div>
      </div>
    </main>
  );
}

// カード用のスケルトンローディング
export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-gray-200 rounded-xl shadow-sm p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 
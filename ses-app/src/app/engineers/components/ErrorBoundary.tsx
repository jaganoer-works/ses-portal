"use client";

type ErrorDisplayProps = {
  message?: string;
};

export function ErrorDisplay({ 
  message = "技術者データの取得に失敗しました"
}: ErrorDisplayProps) {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          エラーが発生しました
        </h2>
        
        <p className="text-sub">
          {message}
        </p>
      </div>
    </div>
  );
} 
import React from "react";

type ErrorDisplayProps = {
  message: string;
};

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            再読み込み
          </button>
        </div>
      </div>
    </main>
  );
} 
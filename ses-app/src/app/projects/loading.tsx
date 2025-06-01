import React from "react";

export default function ProjectsLoading() {
  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </header>

        {/* カードのスケルトン */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 
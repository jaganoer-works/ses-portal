"use client";

import { useState, useEffect } from "react";
import { InteractionFilter as FilterType } from "@/lib/api/interactions";
import { usePermissions } from "@/hooks/usePermissions";

interface InteractionFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function InteractionFilter({ currentFilter, onFilterChange }: InteractionFilterProps) {
  const [projectId, setProjectId] = useState(currentFilter.project || "");
  const [engineerId, setEngineerId] = useState(currentFilter.engineer || "");
  const [isRead, setIsRead] = useState<string>(
    currentFilter.isRead === undefined ? "all" : currentFilter.isRead.toString()
  );
  const [projects, setProjects] = useState<Array<{id: string, title: string}>>([]);
  const [engineers, setEngineers] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, canReadProjects, canReadUsers } = usePermissions();

  // プロジェクトと技術者の一覧を取得
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        
        // 認証チェック
        if (!isAuthenticated) {
          return;
        }

        // プロジェクト一覧取得
        if (canReadProjects) {
          const projectsResponse = await fetch("/api/projects");
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData.map((p: any) => ({ id: p.id, title: p.title })));
          }
        }

        // 技術者一覧取得
        if (canReadUsers) {
          const engineersResponse = await fetch("/api/users");
          if (engineersResponse.ok) {
            const engineersData = await engineersResponse.json();
            setEngineers(engineersData.map((e: any) => ({ id: e.id, name: e.name })));
          }
        }
      } catch (error) {
        console.error("選択肢データの取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    // 認証状態が確定してからAPI呼び出し
    if (isAuthenticated !== undefined) {
      fetchOptions();
    }
  }, [isAuthenticated, canReadProjects, canReadUsers]);

  // フィルタ適用
  const handleApplyFilter = () => {
    const newFilter: FilterType = {};
    
    if (projectId) newFilter.project = projectId;
    if (engineerId) newFilter.engineer = engineerId;
    if (isRead !== "all") newFilter.isRead = isRead === "true";

    onFilterChange(newFilter);
  };

  // フィルタリセット
  const handleResetFilter = () => {
    setProjectId("");
    setEngineerId("");
    setIsRead("all");
    onFilterChange({});
  };

  // 現在のフィルタの同期
  useEffect(() => {
    setProjectId(currentFilter.project || "");
    setEngineerId(currentFilter.engineer || "");
    setIsRead(
      currentFilter.isRead === undefined ? "all" : currentFilter.isRead.toString()
    );
  }, [currentFilter]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">フィルタ</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* 案件選択 */}
        <div>
          <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 mb-2">
            案件
          </label>
          <select
            id="project-filter"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={!canReadProjects}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">すべての案件</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        {/* 技術者選択 */}
        <div>
          <label htmlFor="engineer-filter" className="block text-sm font-medium text-gray-700 mb-2">
            技術者
          </label>
          <select
            id="engineer-filter"
            value={engineerId}
            onChange={(e) => setEngineerId(e.target.value)}
            disabled={!canReadUsers}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">すべての技術者</option>
            {engineers.map((engineer) => (
              <option key={engineer.id} value={engineer.id}>
                {engineer.name}
              </option>
            ))}
          </select>
        </div>

        {/* 既読状態選択 */}
        <div>
          <label htmlFor="read-status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            既読状態
          </label>
          <select
            id="read-status-filter"
            value={isRead}
            onChange={(e) => setIsRead(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="false">未読のみ</option>
            <option value="true">既読のみ</option>
          </select>
        </div>

        {/* ボタン */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            適用
          </button>
          <button
            onClick={handleResetFilter}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            リセット
          </button>
        </div>
      </div>

      {/* 現在のフィルタ状態表示 */}
      {(currentFilter.project || currentFilter.engineer || currentFilter.isRead !== undefined) && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">適用中のフィルタ: </span>
          {currentFilter.project && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-2">
              案件指定
            </span>
          )}
          {currentFilter.engineer && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs mr-2">
              技術者指定
            </span>
          )}
          {currentFilter.isRead !== undefined && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs mr-2">
              {currentFilter.isRead ? "既読のみ" : "未読のみ"}
            </span>
          )}
        </div>
      )}
    </div>
  );
} 
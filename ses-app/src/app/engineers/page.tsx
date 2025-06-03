"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EngineerListItem } from "@/lib/types/user";
import { EngineerCard } from "./components/EngineerCard";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Button } from "@/components/ui/Button";
import { EmptyStateCard } from "@/components/ui/Card";
import { PageLoading } from "@/components/ui/Loading";
import { PageLayout } from "@/components/layout";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Permission } from "@/lib/permissions";

export default function EngineersPage() {
  const [engineers, setEngineers] = useState<EngineerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const permissions = usePermissions();

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("/api/engineers");
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("技術者情報へのアクセス権限がありません");
          } else if (response.status === 401) {
            throw new Error("認証が必要です");
          } else {
            throw new Error("技術者データの取得に失敗しました");
          }
        }
        
        const data = await response.json();
        setEngineers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "技術者データの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    if (permissions.isAuthenticated && permissions.canReadEngineers) {
      fetchEngineers();
    } else if (permissions.isAuthenticated) {
      setError("技術者情報へのアクセス権限がありません");
      setIsLoading(false);
    }
  }, [permissions.isAuthenticated]); // 認証状態のみを依存関係にする

  if (isLoading) {
    return (
      <PageLayout>
        <PageLoading text="技術者データを取得中..." />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorDisplay message={error} />
      </PageLayout>
    );
  }

  // エンジニアロールの場合の表示調整
  const getPageTitle = () => {
    if (permissions.isEngineer) {
      return "マイプロフィール";
    }
    return "技術者一覧";
  };

  const getPageDescription = () => {
    if (permissions.isEngineer) {
      return "ご自身の技術者情報を確認・編集できます";
    }
    return `${engineers.length}名の技術者が登録されています`;
  };

  const getEmptyStateContent = () => {
    if (permissions.isEngineer) {
      return {
        icon: "👤",
        title: "プロフィール情報がありません",
        description: "技術者情報が見つかりませんでした。",
        action: null
      };
    }
    
    return {
      icon: "👥",
      title: "技術者が登録されていません",
      description: "まだ技術者が登録されていません。新しい技術者を登録してください。",
      action: permissions.canCreateEngineers ? (
        <Link href="/engineers/new">
          <Button size="lg">最初の技術者を登録</Button>
        </Link>
      ) : null
    };
  };

  return (
    <PageLayout className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-sub">
              {getPageDescription()}
            </p>
            
            {/* ロール別の説明 */}
            {permissions.isEngineer && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>エンジニア表示:</strong> ご自身の技術者情報のみ表示されています。
                </p>
              </div>
            )}
          </div>
          
          {/* 新規登録ボタン（権限チェック） */}
          <PermissionGuard 
            permission={Permission.ENGINEER_CREATE}
            fallback={
              permissions.isEngineer ? (
                <div className="text-right">
                  <p className="text-xs text-sub">
                    新規登録権限なし
                  </p>
                </div>
              ) : null
            }
          >
            <Link href="/engineers/new">
              <Button>
                {permissions.isEngineer ? "新規技術者登録" : "新規登録"}
              </Button>
            </Link>
          </PermissionGuard>
        </div>
      </header>

      {engineers.length === 0 ? (
        <EmptyStateCard
          icon={getEmptyStateContent().icon}
          title={getEmptyStateContent().title}
          description={getEmptyStateContent().description}
          action={getEmptyStateContent().action}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engineers.map((engineer) => (
            <EngineerCard 
              key={engineer.id} 
              engineer={engineer}
            />
          ))}
        </div>
      )}

      {/* 権限情報表示（デバッグ用・開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">権限情報（開発時のみ表示）</h3>
          <ul className="space-y-1 text-gray-600">
            <li>ロール: {permissions.userRole}</li>
            <li>技術者読み取り: {permissions.canReadEngineers ? "可" : "不可"}</li>
            <li>技術者作成: {permissions.canCreateEngineers ? "可" : "不可"}</li>
            <li>技術者更新: {permissions.canUpdateEngineers ? "可" : "不可"}</li>
            <li>技術者削除: {permissions.canDeleteEngineers ? "可" : "不可"}</li>
          </ul>
        </div>
      )}
    </PageLayout>
  );
} 
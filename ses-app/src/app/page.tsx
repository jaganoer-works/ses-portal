"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardWithHeader, LinkCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Loading";
import { PageLayout } from "@/components/layout";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard, AdminOnly } from "@/components/auth/PermissionGuard";
import { Permission } from "@/lib/permissions";

export default function Home() {
  const { data: session, status } = useSession();
  const permissions = usePermissions();

  if (status === "loading") {
    return <PageLoading text="認証情報を確認中..." />;
  }

  if (!session) {
    return (
      <PageLoading text="認証が必要です..." />
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin": return "管理者";
      case "sales": return "営業";
      case "engineer": return "エンジニア";
      default: return role;
    }
  };

  const getMenuItems = () => {
    const items = [];

    // 案件管理（権限に応じて表示）
    if (permissions.canReadProjects) {
      items.push({
        href: "/projects",
        title: "案件管理",
        description: "案件の一覧・詳細・編集",
        icon: "📋",
        permission: Permission.PROJECT_READ
      });
    }

    // 技術者管理（権限に応じて表示）
    if (permissions.canReadEngineers) {
      items.push({
        href: "/engineers",
        title: "技術者管理", 
        description: permissions.isEngineer ? "自分の情報・プロフィール管理" : "技術者の一覧・詳細・編集",
        icon: "👥",
        permission: Permission.ENGINEER_READ
      });
    }

    // やりとり管理（権限に応じて表示）
    if (permissions.canReadInteractions) {
      items.push({
        href: "/interactions",
        title: "やりとり管理",
        description: "案件と技術者のやりとり履歴",
        icon: "💬",
        permission: Permission.INTERACTION_READ
      });
    }

    return items;
  };

  const getQuickActions = () => {
    const actions = [];

    // 新規案件登録（権限チェック）
    if (permissions.canCreateProjects) {
      actions.push({
        href: "/projects/new",
        label: "📝 新規案件登録",
        permission: Permission.PROJECT_CREATE
      });
    }

    // 新規技術者登録（権限チェック）
    if (permissions.canCreateEngineers) {
      actions.push({
        href: "/engineers/new",
        label: "👤 新規技術者登録",
        permission: Permission.ENGINEER_CREATE
      });
    }

    // 新規やりとり登録（権限チェック）
    if (permissions.canCreateInteractions) {
      actions.push({
        href: "/interactions/new",
        label: "💬 新規やりとり登録",
        permission: Permission.INTERACTION_CREATE
      });
    }

    return actions;
  };

  return (
    <PageLayout>
      {/* ウェルカムセクション */}
      <section className="mb-8">
        <CardWithHeader
          title={`ようこそ、${session.user.name}さん`}
          subtitle={`ロール: ${getRoleDisplayName(session.user.role)}`}
        >
          <p className="text-sub">
            SES管理システムにログインしました。{permissions.isEngineer ? "ご自身の" : "各"}機能をご利用ください。
          </p>
          
          {/* ロール別の説明 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            {permissions.isAdmin && (
              <p className="text-sm text-blue-700">
                <strong>管理者権限:</strong> 全ての機能にアクセス可能です。システム全体の管理を行えます。
              </p>
            )}
            {permissions.isSales && (
              <p className="text-sm text-blue-700">
                <strong>営業権限:</strong> 案件・技術者・やりとりの管理が可能です。削除権限はありません。
              </p>
            )}
            {permissions.isEngineer && (
              <p className="text-sm text-blue-700">
                <strong>エンジニア権限:</strong> 自分の情報と関連するやりとりの確認・更新が可能です。
              </p>
            )}
          </div>
        </CardWithHeader>
      </section>

      {/* 機能メニュー */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          機能メニュー
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getMenuItems().map((item) => (
            <PermissionGuard key={item.href} permission={item.permission}>
              <LinkCard href={item.href} className="h-full">
                <div className="text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sub text-sm">
                    {item.description}
                  </p>
                </div>
              </LinkCard>
            </PermissionGuard>
          ))}
        </div>
      </section>

      {/* システム情報 */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          システム情報
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">
              認証情報
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-sub">ユーザーID:</span>
                <span className="ml-2 font-mono">{session.user.id}</span>
              </div>
              <div>
                <span className="text-sub">メール:</span>
                <span className="ml-2">{session.user.email}</span>
              </div>
              <div>
                <span className="text-sub">ロール:</span>
                <span className="ml-2">{getRoleDisplayName(session.user.role)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">
              クイックアクション
            </h3>
            <div className="space-y-3">
              {getQuickActions().map((action) => (
                <PermissionGuard key={action.href} permission={action.permission}>
                  <Link href={action.href}>
                    <Button variant="outline" className="w-full">
                      {action.label}
                    </Button>
                  </Link>
                </PermissionGuard>
              ))}
              
              {getQuickActions().length === 0 && (
                <p className="text-sm text-sub text-center py-4">
                  作成権限がありません
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* 管理者専用セクション */}
      <AdminOnly>
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            システム管理
          </h2>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">
              管理者機能
            </h3>
            <div className="space-y-3">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">
                  👥 ユーザー管理
                </Button>
              </Link>
              <Link href="/admin/system">
                <Button variant="outline" className="w-full">
                  ⚙️ システム設定
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </AdminOnly>
    </PageLayout>
  );
}

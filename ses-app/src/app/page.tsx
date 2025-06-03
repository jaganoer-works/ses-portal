"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardWithHeader, LinkCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Loading";
import { PageLayout } from "@/components/layout";

export default function Home() {
  const { data: session, status } = useSession();

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

  const getMenuItems = (role: string) => {
    const commonItems = [
      {
        href: "/projects",
        title: "案件管理",
        description: "案件の一覧・詳細・編集",
        icon: "📁"
      },
      {
        href: "/engineers",
        title: "技術者管理",
        description: "技術者の一覧・詳細・編集",
        icon: "👥"
      },
      {
        href: "/interactions",
        title: "やりとり管理",
        description: "案件と技術者のやりとり履歴",
        icon: "💬"
      }
    ];

    // ロールに関係なく全機能アクセス可能（MVP版）
    return commonItems;
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
            SES管理システムにログインしました。各機能をご利用ください。
          </p>
        </CardWithHeader>
      </section>

      {/* 機能メニュー */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          機能メニュー
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getMenuItems(session.user.role).map((item) => (
            <LinkCard
              key={item.href}
              href={item.href}
              className="h-full"
            >
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
              <Link href="/projects/new">
                <Button variant="outline" className="w-full">
                  📝 新規案件登録
                </Button>
              </Link>
              <Link href="/engineers/new">
                <Button variant="outline" className="w-full">
                  👤 新規技術者登録
                </Button>
              </Link>
              <Link href="/interactions/new">
                <Button variant="outline" className="w-full">
                  💬 新規やりとり登録
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
}

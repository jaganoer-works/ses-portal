import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { EngineerListItem } from "@/lib/types/user";
import { EngineerCard } from "./components/EngineerCard";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Button } from "@/components/ui/Button";
import { EmptyStateCard } from "@/components/ui/Card";
import { apiFetchWithError } from "@/lib/api/fetchService";
import { PageLayout } from "@/components/layout";

export const metadata: Metadata = {
  title: "技術者一覧 | SES管理システム",
  description: "SES管理システムの技術者一覧ページです。技術者のスキル、希望単価、稼働状況などを確認できます。",
};

async function fetchEngineers(): Promise<EngineerListItem[]> {
  return apiFetchWithError<EngineerListItem[]>("/api/engineers");
}

export default async function EngineersPage() {
  let engineers: EngineerListItem[] = [];
  let error: string | null = null;

  try {
    engineers = await fetchEngineers();
  } catch (e) {
    error = e instanceof Error ? e.message : "技術者データの取得に失敗しました";
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorDisplay message={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
              技術者一覧
            </h1>
            <p className="text-sub">
              {engineers.length}名の技術者が登録されています
            </p>
          </div>
          
          <Link href="/engineers/new">
            <Button>新規登録</Button>
          </Link>
        </div>
      </header>

      {engineers.length === 0 ? (
        <EmptyStateCard
          icon="👥"
          title="技術者が登録されていません"
          description="まだ技術者が登録されていません。新しい技術者を登録してください。"
          action={
            <Link href="/engineers/new">
              <Button size="lg">最初の技術者を登録</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engineers.map((engineer) => (
            <EngineerCard key={engineer.id} engineer={engineer} />
          ))}
        </div>
      )}
    </PageLayout>
  );
} 
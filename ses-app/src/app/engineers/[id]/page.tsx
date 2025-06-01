import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

// 技術者型定義（APIレスポンスに合わせて適宜調整）
type Skill = { skill: { name: string } };
type Engineer = {
  id: string;
  name: string;
  skills: Skill[];
  desiredPrice?: number;
  availableFrom?: string;
  status?: string;
  description?: string;
  email?: string;
  // 他のプロパティも必要に応じて追加
};

async function fetchEngineer(id: string): Promise<Engineer | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function EngineerDetailPage({ params }: { params: { id: string } }) {
  const engineer = await fetchEngineer(params.id);
  if (!engineer) return notFound();

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-accent mb-8">技術者詳細</h1>
        <div className="w-full bg-card border border-base rounded-xl shadow-md p-6 flex flex-col gap-4">
          <div className="font-bold text-xl text-accent-dark">{engineer.name}</div>
          <div className="text-accent text-sm">
            スキル: {engineer.skills.map(s => s.skill.name).join(", ") || "-"}
          </div>
          <div className="text-sm text-main">
            希望単価: <span className="text-accent-dark font-semibold">{engineer.desiredPrice ?? "-"}</span>
          </div>
          <div className="text-sm text-sub">
            稼働開始日: {engineer.availableFrom ? engineer.availableFrom.slice(0, 10) : "-"}
          </div>
          <div className="text-sm text-sub">
            ステータス: {engineer.status ?? "-"}
          </div>
          <div className="text-sm text-sub">
            メール: {engineer.email ?? "-"}
          </div>
          <div className="text-sm text-main">
            詳細: {engineer.description ?? "-"}
          </div>
        </div>
      </div>
    </main>
  );
} 
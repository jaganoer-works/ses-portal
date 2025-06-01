import React from "react";

// 技術者型定義（APIレスポンスに合わせて適宜調整）
type Skill = { skill: { name: string } };
type Engineer = {
  id: number;
  name: string;
  skills: Skill[];
  desired_price?: number;
  available_from?: string;
  status?: string;
};

async function fetchEngineers(): Promise<Engineer[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/users`, { cache: "no-store" });
  if (!res.ok) throw new Error("技術者データの取得に失敗しました");
  return res.json();
}

export default async function EngineersPage() {
  let engineers: Engineer[] = [];
  try {
    engineers = await fetchEngineers();
  } catch (e) {
    return <div className="text-red-600 p-8">技術者データの取得に失敗しました</div>;
  }

  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-accent mb-8">技術者一覧</h1>
      <div className="grid grid-cols-1 gap-6">
        {engineers.map((e) => (
          <div
            key={e.id}
            className="w-full bg-card border border-base rounded-xl shadow-md p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow"
          >
            <div className="font-bold text-lg text-accent-dark">{e.name}</div>
            <div className="text-accent text-sm">
              スキル: {e.skills.map(s => s.skill.name).join(", ") || "-"}
            </div>
            <div className="text-sm text-main">
              希望単価: <span className="text-accent-dark font-semibold">{e.desired_price ?? "-"}</span>
            </div>
            <div className="text-sm text-sub">
              稼働開始日: {e.available_from ?? "-"}
            </div>
            <div className="text-sm text-sub">
              ステータス: {e.status ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 
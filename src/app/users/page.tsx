import React from "react";
import { Card, CardContent } from "@/components/ui/card";

async function fetchUsers() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/users`, { cache: "no-store" });
  if (!res.ok) throw new Error("ユーザー取得に失敗しました");
  return res.json();
}

export default async function UsersPage() {
  const users = await fetchUsers();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>
      <div className="flex flex-col gap-4">
        {users.map((user: any) => (
          <Card key={user.id} className="w-full">
            <CardContent className="flex flex-row items-center gap-8 py-6">
              <div className="flex-1 font-semibold text-lg">{user.name}</div>
              <div className="flex-1 text-gray-600">{user.email}</div>
              <div className="flex-1">
                {user.skills && user.skills.length > 0
                  ? user.skills.map((s: any) => s.skill.name).join(", ")
                  : "-"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
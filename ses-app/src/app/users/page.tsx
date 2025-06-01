import React from "react";

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
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">名前</th>
              <th className="px-4 py-2 border-b">メール</th>
              <th className="px-4 py-2 border-b">スキル</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id}>
                <td className="px-4 py-2 border-b">{user.name}</td>
                <td className="px-4 py-2 border-b">{user.email}</td>
                <td className="px-4 py-2 border-b">
                  {user.skills && user.skills.length > 0
                    ? user.skills.map((s: any) => s.skill.name).join(", ")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
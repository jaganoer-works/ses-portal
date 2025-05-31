// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

const dummyProjects = [
  {
    id: '1a111111-1111-1111-1111-111111111111',
    title: 'React/Next.js開発案件',
    price: 700000,
    periodStart: '2024-06-01',
    periodEnd: '2024-12-31',
    skills: 'React,Next.js,TypeScript',
    location: '東京都・リモート可',
    description: '大手Webサービスのフロントエンド開発案件です。',
    status: '募集中',
  },
  {
    id: '2b222222-2222-2222-2222-222222222222',
    title: 'AWSインフラ構築案件',
    price: 800000,
    periodStart: '2024-07-01',
    periodEnd: '2025-01-31',
    skills: 'AWS,Terraform,CI/CD',
    location: 'フルリモート',
    description: 'クラウドインフラの設計・構築・運用案件です。',
    status: '募集中',
  },
  {
    id: '3c333333-3333-3333-3333-333333333333',
    title: 'Pythonデータ分析案件',
    price: 650000,
    periodStart: '2024-06-15',
    periodEnd: '2024-09-30',
    skills: 'Python,Pandas,SQL',
    location: '大阪府・一部リモート',
    description: '製造業向けデータ分析・可視化案件です。',
    status: '募集中',
  },
];

export default function ProjectListPage() {
  const projects = dummyProjects;

  const formatDate = (date: string) => {
    return date;
  };

  return (
    <main className="p-8 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">案件一覧</h1>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white border border-blue-200 rounded-lg overflow-hidden">
          <thead className="bg-blue-100">
            <tr>
              <th className="py-2 px-4 border-b border-blue-200 text-blue-800">案件名</th>
              <th className="py-2 px-4 border-b border-blue-200 text-blue-800">単価</th>
              <th className="py-2 px-4 border-b border-blue-200 text-blue-800">期間</th>
              <th className="py-2 px-4 border-b border-blue-200 text-blue-800">スキル</th>
              <th className="py-2 px-4 border-b border-blue-200 text-blue-800">勤務地</th>
              <th className="py-2 px-4 border-b border-blue-200 text-blue-800">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-blue-50 transition-colors">
                <td className="py-2 px-4 border-b border-blue-100 text-blue-900 font-medium">{project.title}</td>
                <td className="py-2 px-4 border-b border-blue-100 text-blue-700">{project.price.toLocaleString()}円/月</td>
                <td className="py-2 px-4 border-b border-blue-100 text-blue-700">{formatDate(project.periodStart)} ~ {formatDate(project.periodEnd)}</td>
                <td className="py-2 px-4 border-b border-blue-100 text-blue-700">{project.skills}</td>
                <td className="py-2 px-4 border-b border-blue-100 text-blue-700">{project.location}</td>
                <td className="py-2 px-4 border-b border-blue-100 text-blue-700">{project.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
} 
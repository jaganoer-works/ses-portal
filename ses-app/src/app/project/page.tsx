import Link from "next/link";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="bg-white border border-blue-200 rounded-xl shadow-md p-6 flex flex-col hover:shadow-lg transition">
            <h2 className="text-xl font-bold text-blue-900 mb-2">{project.title}</h2>
            <div className="text-blue-700 mb-1 font-semibold">{project.price.toLocaleString()}円/月</div>
            <div className="text-sm text-blue-600 mb-2">{formatDate(project.periodStart)} ~ {formatDate(project.periodEnd)}</div>
            <div className="text-gray-700 mb-2 whitespace-pre-line break-words">{project.description}</div>
            <div className="mt-auto flex justify-between items-end">
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">{project.status}</span>
              <Link href={`/project/${project.id}`} className="ml-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition">詳細を見る</Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 
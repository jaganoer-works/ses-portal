import Link from "next/link";
import { notFound } from "next/navigation";

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

function formatDateJp(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

interface ProjectDetailPageProps {
  params: { id: string };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = dummyProjects.find((p) => p.id === params.id);

  if (!project) {
    return (
      <main className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">案件が見つかりません</h1>
        <Link href="/project" className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition text-sm">一覧に戻る</Link>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-2xl mx-auto bg-white border border-blue-200 rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">{project.title}</h1>
        <div className="mb-2 text-blue-800 font-semibold text-lg">月額 {project.price.toLocaleString()}円</div>
        <div className="mb-2 text-blue-700 text-base">
          {formatDateJp(project.periodStart)} ~ {formatDateJp(project.periodEnd)}
        </div>
        <div className="mb-2 text-gray-700">{project.location}</div>
        <div className="mb-4 text-gray-700 whitespace-pre-line break-words">{project.description}</div>
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-300">{project.status}</span>
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">{project.skills}</span>
        </div>
        <Link href="/project" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition text-sm">一覧に戻る</Link>
      </div>
    </main>
  );
} 
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: '技術者一覧 | SES案件管理システム',
  description: '登録されている技術者の一覧です。スキル、希望単価、稼働状況などを確認できます。',
};

// 型定義
interface Engineer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  desiredPrice: number;
  availableFrom: string;
  description: string;
  status: '稼働可能' | '稼働中' | '面談中';
  isAvailable: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// ダミーデータ
const dummyEngineers: Engineer[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    name: '山田 太郎',
    email: 'yamada@example.com',
    skills: ['React', 'Next.js', 'TypeScript', 'AWS'],
    desiredPrice: 750000,
    availableFrom: '2024-04-01',
    description: `フロントエンド開発を専門としています。
特にReact/Next.jsを使用した大規模Webアプリケーションの開発経験が豊富です。

【得意分野】
・SPA開発
・パフォーマンス最適化
・UI/UX改善

【実績】
・大手ECサイトのリニューアル
・SaaSプロダクトの新規開発`,
    status: '稼働可能',
    isAvailable: true,
    lastLoginAt: '2024-03-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    isActive: true
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    name: '鈴木 花子',
    email: 'suzuki@example.com',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    desiredPrice: 650000,
    availableFrom: '2024-05-01',
    description: `バックエンド開発を専門としています。
Python/Djangoを使用したWebアプリケーション開発が得意です。

【得意分野】
・API設計
・データベース設計
・インフラ構築

【実績】
・金融系システムの開発
・データ分析基盤の構築`,
    status: '稼働中',
    isAvailable: false,
    lastLoginAt: '2024-03-14T15:30:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-14T15:30:00Z',
    isActive: true
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    name: '佐藤 一郎',
    email: 'sato@example.com',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD'],
    desiredPrice: 800000,
    availableFrom: '2024-06-01',
    description: `クラウドインフラエンジニアとして活動しています。
AWSを中心としたインフラ設計・構築・運用が専門です。

【得意分野】
・クラウドアーキテクチャ設計
・IaC
・DevOps

【実績】
・マイクロサービス基盤の構築
・大規模システムのクラウド移行`,
    status: '稼働可能',
    isAvailable: true,
    lastLoginAt: '2024-03-13T09:15:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-13T09:15:00Z',
    isActive: true
  }
];

// ユーティリティ関数
function formatDateJp(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// 技術者カードコンポーネント
function EngineerCard({ engineer }: { engineer: Engineer }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-blue-200 p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-blue-900">{engineer.name}</h2>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
          engineer.isAvailable 
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-gray-100 text-gray-700 border border-gray-300'
        }`}>
          {engineer.status}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="text-blue-800 font-semibold mb-2">
          希望単価: {engineer.desiredPrice.toLocaleString()}円/月
        </div>
        <div className="text-blue-700 text-sm mb-2">
          稼働可能日: {formatDateJp(engineer.availableFrom)}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {engineer.skills.map((skill) => (
            <span key={skill} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4 text-gray-700 text-sm line-clamp-3">
        {engineer.description}
      </div>

      <Link 
        href={`/engineer/${engineer.id}`}
        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition text-sm"
      >
        詳細を見る
      </Link>
    </div>
  );
}

// メインページコンポーネント
export default function EngineerListPage() {
  return (
    <main className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">技術者一覧</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyEngineers.map((engineer) => (
            <EngineerCard key={engineer.id} engineer={engineer} />
          ))}
        </div>
      </div>
    </main>
  );
} 
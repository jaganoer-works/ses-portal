import React from "react";
import Link from "next/link";
import { ProjectListItem } from "@/lib/types/project";

type ProjectCardProps = {
  project: ProjectListItem;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) return "要相談";
    return `${price.toLocaleString()}円`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "募集中": { bgColor: "bg-green-100", textColor: "text-green-800", label: "募集中" },
      "進行中": { bgColor: "bg-blue-100", textColor: "text-blue-800", label: "進行中" },
      "完了": { bgColor: "bg-gray-100", textColor: "text-gray-800", label: "完了" },
      "停止": { bgColor: "bg-red-100", textColor: "text-red-800", label: "停止" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { bgColor: "bg-gray-100", textColor: "text-gray-800", label: status };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  const getPublishedBadge = (published: boolean) => {
    return published ? (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        公開中
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        非公開
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {project.title}
          </h3>
          <div className="flex gap-2 ml-2">
            {getStatusBadge(project.status)}
            {getPublishedBadge(project.published)}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium min-w-[60px]">単価:</span>
            <span className="text-gray-900 font-medium">{formatPrice(project.price)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium min-w-[60px]">期間:</span>
            <span className="text-gray-900">
              {formatDate(project.periodStart)} 〜 {formatDate(project.periodEnd)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Link
            href={`/projects/${project.id}`}
            className="text-accent hover:text-accent-dark font-medium text-sm transition-colors"
          >
            詳細を見る →
          </Link>
          
          <Link
            href={`/projects/${project.id}/edit`}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            編集
          </Link>
        </div>
      </div>
    </div>
  );
} 
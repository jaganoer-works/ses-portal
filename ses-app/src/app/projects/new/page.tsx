import React from "react";
import { Metadata } from "next";
import { ProjectForm } from "../components/ProjectForm";

export const metadata: Metadata = {
  title: "新規案件登録 | SES管理システム",
  description: "新しい案件を登録します。",
};

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-accent mb-2">
            新規案件登録
          </h1>
          <p className="text-sub">
            新しい案件の情報を入力してください。
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <ProjectForm mode="create" />
        </div>
      </div>
    </main>
  );
} 
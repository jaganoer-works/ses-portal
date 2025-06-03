"use client";

import React from "react";
import { Header } from "./Header";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PageLayout({ 
  children, 
  title, 
  subtitle, 
  className = "container mx-auto px-4 py-8 max-w-6xl" 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-base">
      <Header title={title} subtitle={subtitle} />
      <main className={className}>
        {children}
      </main>
    </div>
  );
} 
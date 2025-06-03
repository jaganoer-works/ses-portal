"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "SES管理システム", subtitle = "案件・技術者・やりとり管理" }: HeaderProps) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin": return "管理者";
      case "sales": return "営業";
      case "engineer": return "エンジニア";
      default: return role;
    }
  };

  if (!session) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/" className="text-decoration-none">
              <h1 className="text-2xl font-bold text-accent hover:text-blue-700 transition-colors">
                {title}
              </h1>
            </Link>
            <p className="text-sub text-sm">
              {subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name}
              </p>
              <p className="text-xs text-sub">
                {getRoleDisplayName(session.user.role)}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 
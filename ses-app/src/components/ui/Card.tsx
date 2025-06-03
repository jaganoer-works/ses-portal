import React from "react";
import Link from "next/link";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  border?: boolean;
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  border = true,
  hover = false,
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const classes = [
    "bg-white rounded-lg",
    border && "border border-gray-200",
    shadowClasses[shadow],
    paddingClasses[padding],
    hover && "hover:shadow-lg transition-shadow duration-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

// ヘッダー付きカード
export interface CardWithHeaderProps extends CardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function CardWithHeader({
  title,
  subtitle,
  actions,
  children,
  ...cardProps
}: CardWithHeaderProps) {
  return (
    <Card {...cardProps}>
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-sub mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="ml-4">{actions}</div>}
        </div>
      </div>
      {children}
    </Card>
  );
}

// リンクカード
export interface LinkCardProps extends CardProps {
  href: string;
  external?: boolean;
}

export function LinkCard({
  href,
  external = false,
  children,
  className = "",
  ...cardProps
}: LinkCardProps) {
  const linkProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <Link {...linkProps} className="block">
      <Card
        {...cardProps}
        className={`transition-all duration-200 hover:shadow-lg hover:border-accent/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${className}`}
        hover={true}
      >
        {children}
      </Card>
    </Link>
  );
}

// ステータス付きカード
export interface StatusCardProps extends CardProps {
  status: string;
  statusColor?: "green" | "blue" | "yellow" | "red" | "gray";
}

export function StatusCard({
  status,
  statusColor = "gray",
  children,
  ...cardProps
}: StatusCardProps) {
  const statusColorClasses = {
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <Card {...cardProps}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">{children}</div>
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${statusColorClasses[statusColor]}`}
        >
          {status}
        </span>
      </div>
    </Card>
  );
}

// 空状態カード
export interface EmptyStateCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateCardProps) {
  return (
    <Card className={`text-center py-12 ${className}`}>
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      {description && <p className="text-sub mb-6">{description}</p>}
      {action && action}
    </Card>
  );
} 
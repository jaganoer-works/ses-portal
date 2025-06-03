import React from "react";
import { Button, ButtonProps } from "../ui/Button";

export interface FormActionsProps {
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  submitVariant?: ButtonProps["variant"];
  cancelVariant?: ButtonProps["variant"];
  showCancel?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FormActions({
  submitText = "保存",
  cancelText = "キャンセル",
  onCancel,
  isSubmitting = false,
  submitDisabled = false,
  submitVariant = "primary",
  cancelVariant = "outline",
  showCancel = true,
  className = "",
  children,
}: FormActionsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {children}
      <div className="flex items-center gap-3 ml-auto">
        {showCancel && onCancel && (
          <Button
            type="button"
            variant={cancelVariant}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          variant={submitVariant}
          isLoading={isSubmitting}
          disabled={submitDisabled}
        >
          {submitText}
        </Button>
      </div>
    </div>
  );
}

// カスタムアクション付きフォームアクション
export interface CustomFormActionsProps {
  actions: Array<{
    key: string;
    text: string;
    variant?: ButtonProps["variant"];
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
    isLoading?: boolean;
  }>;
  className?: string;
}

export function CustomFormActions({ actions, className = "" }: CustomFormActionsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {actions.map((action) => (
        <Button
          key={action.key}
          type={action.type || "button"}
          variant={action.variant || "outline"}
          onClick={action.onClick}
          disabled={action.disabled}
          isLoading={action.isLoading}
        >
          {action.text}
        </Button>
      ))}
    </div>
  );
}

// フォームのセクション区切り
export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className = "" }: FormSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

// フォーム全体のラッパー
export interface FormContainerProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
  error?: string;
}

export function FormContainer({ onSubmit, children, className = "", error }: FormContainerProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800">
              <strong>エラー:</strong> {error}
            </div>
          </div>
        </div>
      )}
      {children}
    </form>
  );
} 
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project, ProjectFormData } from "@/lib/types/project";
import { FormField, CheckboxField } from "@/components/forms/FormField";
import { FormActions } from "@/components/forms/FormActions";
import { FormContainer } from "@/components/forms/FormActions";
import { useForm, validators, combineValidators } from "@/hooks/useForm";

type ProjectFormProps = {
  mode: "create" | "edit";
  initialData?: Project;
};

const initialFormData: ProjectFormData = {
  title: "",
  price: "",
  periodStart: "",
  periodEnd: "",
  description: "",
  status: "募集中",
  published: false,
};

const statusOptions = [
  { value: "募集中", label: "募集中" },
  { value: "進行中", label: "進行中" },
  { value: "完了", label: "完了" },
  { value: "停止", label: "停止" },
];

// バリデーション関数
const validateProjectForm = (values: ProjectFormData) => {
  const errors: Record<string, string> = {};

  // タイトルの検証
  const titleError = combineValidators(
    validators.required("案件タイトルは必須です"),
    validators.minLength(2, "案件タイトルは2文字以上で入力してください"),
    validators.maxLength(100, "案件タイトルは100文字以内で入力してください")
  )(values.title);
  if (titleError) errors.title = titleError;

  // 期間の検証
  const startDateError = validators.required("開始日は必須です")(values.periodStart);
  if (startDateError) errors.periodStart = startDateError;

  const endDateError = validators.required("終了日は必須です")(values.periodEnd);
  if (endDateError) errors.periodEnd = endDateError;

  // 開始日 <= 終了日の検証
  if (values.periodStart && values.periodEnd) {
    const startDate = new Date(values.periodStart);
    const endDate = new Date(values.periodEnd);
    if (startDate > endDate) {
      errors.periodEnd = "終了日は開始日以降の日付を選択してください";
    }
  }

  // 単価の検証（任意フィールドだが、入力時は正の数値）
  if (values.price !== "" && values.price !== null) {
    const priceNumber = Number(values.price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      errors.price = "単価は0以上の数値で入力してください";
    }
  }

  return errors;
};

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();

  const form = useForm<ProjectFormData>({
    initialValues: initialFormData,
    validate: validateProjectForm,
    onSubmit: async (values) => {
      const submitData = {
        ...values,
        price: values.price === "" ? null : values.price,
        periodStart: new Date(values.periodStart).toISOString(),
        periodEnd: new Date(values.periodEnd).toISOString(),
      };

      const url = mode === "create" 
        ? "/api/projects" 
        : `/api/projects/${initialData?.id}`;
      
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 案件の${mode === "create" ? "作成" : "更新"}に失敗しました`);
      }

      const result = await response.json();
      
      // 成功時は詳細ページにリダイレクト
      if (mode === "create") {
        router.push(`/projects/${result.id}`);
      } else {
        router.push(`/projects/${result.id}`);
      }
    },
  });

  // 編集モードの場合、初期データを設定
  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.setValue("title", initialData.title);
      form.setValue("price", initialData.price || "");
      form.setValue("periodStart", initialData.periodStart.split('T')[0]);
      form.setValue("periodEnd", initialData.periodEnd.split('T')[0]);
      form.setValue("description", initialData.description || "");
      form.setValue("status", initialData.status);
      form.setValue("published", initialData.published);
    }
  }, [mode, initialData, form.setValue]);

  const handleCancel = () => {
    if (mode === "edit" && initialData) {
      router.push(`/projects/${initialData.id}`);
    } else {
      router.push("/projects");
    }
  };

  return (
    <FormContainer onSubmit={form.handleSubmit} error={form.errors.general}>
      {/* 案件タイトル */}
      <FormField
        label="案件タイトル"
        name="title"
        value={form.values.title}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        required
        placeholder="案件のタイトルを入力してください"
        error={form.touched.title ? form.errors.title : undefined}
      />

      {/* 単価 */}
      <FormField
        label="単価（円）"
        name="price"
        type="number"
        value={form.values.price}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        placeholder="例: 650000"
        min={0}
        error={form.touched.price ? form.errors.price : undefined}
        helpText="空欄の場合は「要相談」として表示されます"
      />

      {/* 期間 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="開始日"
          name="periodStart"
          type="date"
          value={form.values.periodStart}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          required
          error={form.touched.periodStart ? form.errors.periodStart : undefined}
        />
        
        <FormField
          label="終了日"
          name="periodEnd"
          type="date"
          value={form.values.periodEnd}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          required
          error={form.touched.periodEnd ? form.errors.periodEnd : undefined}
        />
      </div>

      {/* ステータス */}
      <FormField
        label="ステータス"
        name="status"
        type="select"
        value={form.values.status}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        required
        options={statusOptions}
        error={form.touched.status ? form.errors.status : undefined}
      />

      {/* 案件詳細 */}
      <FormField
        label="案件詳細"
        name="description"
        type="textarea"
        value={form.values.description}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        placeholder="案件の詳細な説明を入力してください（任意）"
        rows={6}
        error={form.touched.description ? form.errors.description : undefined}
      />

      {/* 公開設定 */}
      <CheckboxField
        label="この案件を公開する"
        name="published"
        checked={form.values.published}
        onChange={form.handleChange}
        helpText="チェックを入れると、技術者検索画面で案件が表示されます"
        error={form.touched.published ? form.errors.published : undefined}
      />

      {/* アクションボタン */}
      <FormActions
        submitText={mode === "create" ? "案件を作成" : "変更を保存"}
        cancelText="キャンセル"
        onCancel={handleCancel}
        isSubmitting={form.isSubmitting}
        submitDisabled={!form.isValid}
      />
    </FormContainer>
  );
} 
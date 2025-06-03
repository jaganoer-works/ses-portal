"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/forms/FormField";
import { FormActions } from "@/components/forms/FormActions";
import { FormContainer } from "@/components/forms/FormActions";
import { useForm, validators, combineValidators } from "@/hooks/useForm";
import { Card, CardWithHeader } from "@/components/ui/Card";

interface LoginFormData {
  email: string;
  password: string;
}

const initialFormData: LoginFormData = {
  email: "",
  password: "",
};

// バリデーション関数
const validateLoginForm = (values: LoginFormData) => {
  const errors: Record<string, string> = {};

  const emailError = combineValidators(
    validators.required("メールアドレスは必須です"),
    validators.email()
  )(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validators.required("パスワードは必須です")(values.password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

export default function SignInPage() {
  const router = useRouter();

  const form = useForm<LoginFormData>({
    initialValues: initialFormData,
    validate: validateLoginForm,
    onSubmit: async (values) => {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        form.setError("password", "メールアドレスまたはパスワードが正しくありません");
        return;
      }

      // ログイン成功時はホームページにリダイレクト
      router.push("/");
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SES管理システム
          </h1>
          <p className="text-gray-600">
            ログインしてシステムをご利用ください
          </p>
        </div>

        <CardWithHeader
          title="ログイン"
          className="shadow-lg"
        >
          <FormContainer onSubmit={form.handleSubmit}>
            {/* メールアドレス */}
            <FormField
              label="メールアドレス"
              name="email"
              type="email"
              value={form.values.email}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              required
              placeholder="user@example.com"
              error={form.touched.email ? form.errors.email : undefined}
            />

            {/* パスワード */}
            <FormField
              label="パスワード"
              name="password"
              type="password"
              value={form.values.password}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              required
              placeholder="パスワードを入力"
              error={form.touched.password ? form.errors.password : undefined}
            />

            {/* ログインボタン */}
            <FormActions
              submitText="ログイン"
              isSubmitting={form.isSubmitting}
              submitDisabled={!form.isValid}
              showCancel={false}
              className="pt-2"
            />
          </FormContainer>

          {/* デモユーザー情報 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              デモアカウント
            </h3>
            <div className="space-y-1 text-xs text-blue-700">
              <div><strong>管理者:</strong> admin@example.com / admin123</div>
              <div><strong>営業:</strong> sales@example.com / password123</div>
              <div><strong>エンジニア:</strong> taro@example.com / password123</div>
            </div>
          </div>
        </CardWithHeader>
      </div>
    </main>
  );
} 
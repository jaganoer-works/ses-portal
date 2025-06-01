import { NextResponse } from "next/server";

/**
 * API用の共通エラーレスポンス生成関数
 * @param error エラー内容（stringまたはError）
 * @param status HTTPステータス（デフォルト500）
 */
export function apiError(error: string | Error, status: number = 500) {
  return NextResponse.json(
    { error: typeof error === "string" ? error : error.message },
    { status }
  );
} 
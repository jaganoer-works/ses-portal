import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/lib/httpStatus";

/**
 * API用の共通エラーレスポンス生成関数
 * @param error エラー内容（string/配列/Error）
 * @param status HTTPステータス（デフォルト500）
 */
export function apiError(
  error: string | Error | Array<{ field: string; message: string }>,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
) {
  return NextResponse.json(
    { error: error },
    { status }
  );
} 
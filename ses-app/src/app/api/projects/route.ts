import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { toPrismaNull } from "@/lib/prismaUtils";
import { withAuth, requirePermission } from "@/lib/authMiddleware";
import { Permission } from "@/lib/permissions";

const prisma = new PrismaClient();

// 案件一覧取得（GET）- 権限チェック付き
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    // エンジニアロールの場合は関連する案件のみ表示（今回は全て表示）
    // 将来的には案件-技術者のリレーションを使って絞り込み可能
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json(projects);
  } catch (e) {
    console.error("案件一覧取得エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.PROJECT_READ));

// 案件新規作成（POST）- 権限チェック付き
export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    const data = await req.json();
    const { user } = session;
    
    // TODO: projectSchemaを追加してバリデーション
    const prismaData = toPrismaNull({
      ...data,
      createdBy: user.id,
      updatedBy: user.id
    });
    
    const project = await prisma.project.create({
      data: prismaData as any,
    });
    
    return NextResponse.json(project, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    console.error("案件作成エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.PROJECT_CREATE)); 
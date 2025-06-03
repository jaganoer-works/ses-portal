import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { toPrismaNull } from "@/lib/prismaUtils";
import { withAuth, requirePermission } from "@/lib/authMiddleware";
import { Permission } from "@/lib/permissions";

const prisma = new PrismaClient();

// 案件詳細取得（GET）- 権限チェック付き
export const GET = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      return apiError("案件が見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    
    return NextResponse.json(project);
  } catch (e) {
    console.error("案件詳細取得エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.PROJECT_READ));

// 案件更新（PUT）- 権限チェック付き
export const PUT = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const data = await req.json();
    const { user } = session;
    
    // 既存の案件が存在するか確認
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });
    if (!existingProject) {
      return apiError("案件が見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    
    // TODO: projectSchemaを追加してバリデーション
    const prismaData = toPrismaNull({
      ...data,
      updatedBy: user.id
    });
    
    const project = await prisma.project.update({
      where: { id },
      data: prismaData as any,
    });
    
    return NextResponse.json(project);
  } catch (e) {
    console.error("案件更新エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.PROJECT_UPDATE));

// 案件削除（DELETE）- 権限チェック付き
export const DELETE = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    
    // 既存の案件が存在するか確認
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });
    if (!existingProject) {
      return apiError("案件が見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ message: "案件が削除されました" });
  } catch (e) {
    console.error("案件削除エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.PROJECT_DELETE)); 
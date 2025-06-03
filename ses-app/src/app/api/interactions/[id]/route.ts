import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { toPrismaNull } from "@/lib/prismaUtils";
import { interactionSchema } from "@/lib/schema/interactionSchema";
import { withAuth, requirePermission, requireOwnershipOrPermission } from "@/lib/authMiddleware";
import { Permission } from "@/lib/permissions";

const prisma = new PrismaClient();

// やり取り詳細取得（GET）- 権限チェック付き
export const GET = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const { user } = session;
    
    const interaction = await prisma.interaction.findUnique({
      where: { id },
      include: { 
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            description: true
          }
        }
      },
    });
    
    if (!interaction) {
      return apiError("やり取りが見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    
    // エンジニアロールの場合は自分に関連するもののみ
    if (user.role === "engineer" && interaction.engineerId !== user.id) {
      return apiError("アクセス権限がありません", HTTP_STATUS.FORBIDDEN);
    }
    
    return NextResponse.json(interaction);
  } catch (e) {
    console.error("やりとり詳細取得エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.INTERACTION_READ));

// やり取り更新（PUT）- 権限チェック付き
export const PUT = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const data = await req.json();
    const { user } = session;
    
    // 既存のやりとりを取得（所有者チェック用）
    const existingInteraction = await prisma.interaction.findUnique({
      where: { id }
    });
    if (!existingInteraction) {
      return apiError("やり取りが見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    
    // エンジニアロールの場合は自分に関連するもののみ
    if (user.role === "engineer" && existingInteraction.engineerId !== user.id) {
      return apiError("アクセス権限がありません", HTTP_STATUS.FORBIDDEN);
    }
    
    // 部分的なバリデーション（更新の場合は一部フィールドのみ）
    const partialSchema = interactionSchema.partial().omit({ 
      projectId: true, 
      engineerId: true 
    });
    const validationResult = partialSchema.safeParse(data);
    if (!validationResult.success) {
      return apiError(
        `バリデーションエラー: ${validationResult.error.errors.map(e => e.message).join(", ")}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const prismaData = toPrismaNull({
      ...validationResult.data,
      updatedBy: user.id
    });
    
    const interaction = await prisma.interaction.update({
      where: { id },
      data: prismaData as any,
      include: { 
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            description: true
          }
        }
      },
    });
    return NextResponse.json(interaction);
  } catch (e) {
    console.error("やりとり更新エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.INTERACTION_UPDATE));

// やり取り削除（DELETE）- 権限チェック付き
export const DELETE = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    
    // 存在確認
    const existingInteraction = await prisma.interaction.findUnique({
      where: { id }
    });
    if (!existingInteraction) {
      return apiError("やり取りが見つかりません", HTTP_STATUS.NOT_FOUND);
    }

    await prisma.interaction.delete({ where: { id } });
    return NextResponse.json({ message: "やり取りが削除されました" });
  } catch (e) {
    console.error("やりとり削除エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.INTERACTION_DELETE)); 
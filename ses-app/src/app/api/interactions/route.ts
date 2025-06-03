import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { toPrismaNull } from "@/lib/prismaUtils";
import { interactionSchema } from "@/lib/schema/interactionSchema";
import { withAuth, requirePermission } from "@/lib/authMiddleware";
import { Permission } from "@/lib/permissions";

const prisma = new PrismaClient();

// やり取り一覧取得（GET）- 権限チェック付き
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("project");
    const engineerId = url.searchParams.get("engineer");
    const isRead = url.searchParams.get("isRead");
    const { user } = session;

    // フィルタ条件の構築
    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (engineerId) where.engineerId = engineerId;
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === "true";
    }

    // エンジニアロールの場合は自分に関連するやりとりのみ
    if (user.role === "engineer") {
      where.engineerId = user.id;
    }

    const interactions = await prisma.interaction.findMany({
      where,
      include: { 
        project: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(interactions);
  } catch (e) {
    console.error("やりとり一覧取得エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.INTERACTION_READ));

// やり取り新規作成（POST）- 権限チェック付き
export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    const data = await req.json();
    const { user } = session;
    
    // バリデーション
    const validationResult = interactionSchema.safeParse(data);
    if (!validationResult.success) {
      return apiError(
        `バリデーションエラー: ${validationResult.error.errors.map(e => e.message).join(", ")}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const prismaData = toPrismaNull({
      ...validationResult.data,
      createdBy: user.id,
      updatedBy: user.id
    });
    
    const interaction = await prisma.interaction.create({
      data: {
        ...prismaData,
        isRead: false, // デフォルトで未読
      } as any,
      include: { 
        project: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
    });
    return NextResponse.json(interaction, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    console.error("やりとり作成エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.INTERACTION_CREATE)); 
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { toPrismaNull } from "@/lib/prismaUtils";
import { interactionSchema } from "@/lib/schema/interactionSchema";

const prisma = new PrismaClient();

// やり取り一覧取得（GET）
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("project");
    const engineerId = url.searchParams.get("engineer");
    const isRead = url.searchParams.get("isRead");

    // フィルタ条件の構築
    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (engineerId) where.engineerId = engineerId;
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === "true";
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
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// やり取り新規作成（POST）
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // バリデーション
    const validationResult = interactionSchema.safeParse(data);
    if (!validationResult.success) {
      return apiError(
        `バリデーションエラー: ${validationResult.error.errors.map(e => e.message).join(", ")}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const prismaData = toPrismaNull(validationResult.data);
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
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
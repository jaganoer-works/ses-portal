import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { toPrismaNull } from "@/lib/prismaUtils";
import { interactionSchema } from "@/lib/schema/interactionSchema";

const prisma = new PrismaClient();

// やり取り詳細取得（GET）
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    return NextResponse.json(interaction);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// やり取り更新（PUT）
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
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

    const prismaData = toPrismaNull(validationResult.data);
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
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// やり取り削除（DELETE）
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
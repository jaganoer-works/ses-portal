import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { toPrismaNull } from "@/lib/prismaUtils";

const prisma = new PrismaClient();

// やり取り詳細取得（GET）
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const interaction = await prisma.interaction.findUnique({
      where: { id: params.id },
      include: { project: true },
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
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    // TODO: interactionSchemaを追加してバリデーション
    const prismaData = toPrismaNull(data);
    const interaction = await prisma.interaction.update({
      where: { id: params.id },
      data: prismaData as any,
      include: { project: true },
    });
    return NextResponse.json(interaction);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// やり取り削除（DELETE）
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.interaction.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "やり取りが削除されました" });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
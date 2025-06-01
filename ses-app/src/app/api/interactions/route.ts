import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { toPrismaNull } from "@/lib/prismaUtils";

const prisma = new PrismaClient();

// やり取り一覧取得（GET）
export async function GET(req: NextRequest) {
  try {
    const interactions = await prisma.interaction.findMany({
      include: { project: true },
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
    // TODO: interactionSchemaを追加してバリデーション
    const prismaData = toPrismaNull(data);
    const interaction = await prisma.interaction.create({
      data: prismaData as any,
      include: { project: true },
    });
    return NextResponse.json(interaction, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
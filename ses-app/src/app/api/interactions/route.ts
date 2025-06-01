import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";

const prisma = new PrismaClient();

// やりとり一覧取得（GET）
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

// やりとり新規作成（POST）
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.projectId || !data.engineerId || !data.message) {
      return apiError("projectId, engineerId, messageは必須です", HTTP_STATUS.BAD_REQUEST);
    }
    const interaction = await prisma.interaction.create({
      data,
      include: { project: true },
    });
    return NextResponse.json(interaction, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
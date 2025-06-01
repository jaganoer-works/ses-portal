import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";

const prisma = new PrismaClient();

// プロジェクト一覧取得（GET）
export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: { interactions: true },
    });
    return NextResponse.json(projects);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// プロジェクト新規作成（POST）
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.title || !data.price) {
      return apiError("titleとpriceは必須です", HTTP_STATUS.BAD_REQUEST);
    }
    const project = await prisma.project.create({
      data,
      include: { interactions: true },
    });
    return NextResponse.json(project, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
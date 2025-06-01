import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { toPrismaNull } from "@/lib/prismaUtils";

const prisma = new PrismaClient();

// 案件一覧取得（GET）
export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany();
    return NextResponse.json(projects);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// 案件新規作成（POST）
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // TODO: projectSchemaを追加してバリデーション
    const prismaData = toPrismaNull(data);
    const project = await prisma.project.create({
      data: prismaData as any,
    });
    return NextResponse.json(project, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
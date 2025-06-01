import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { projectSchema } from "@/lib/schema/projectSchema";

const prisma = new PrismaClient();

// Prismaのoptional値をnullに変換するユーティリティ
function toPrismaNull<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
  ) as Partial<T>;
}

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
    const parsed = projectSchema.safeParse(data);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP_STATUS.BAD_REQUEST);
    }
    const prismaData = toPrismaNull(parsed.data);
    const project = await prisma.project.create({
      data: { ...prismaData } as any,
      include: { interactions: true },
    });
    return NextResponse.json(project, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
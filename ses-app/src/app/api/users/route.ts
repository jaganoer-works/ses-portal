import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";

const prisma = new PrismaClient();

// ユーザー一覧取得（GET）
export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: { skills: { include: { skill: true } } },
    });
    return NextResponse.json(users);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// ユーザー新規作成（POST）
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // 簡易バリデーション例
    if (!data.name || !data.email) {
      return apiError("nameとemailは必須です", HTTP_STATUS.BAD_REQUEST);
    }
    const user = await prisma.user.create({
      data: {
        ...data,
        skills: data.skills
          ? {
              create: data.skills.map((skillName: string) => ({
                skill: { connect: { name: skillName } },
              })),
            }
          : undefined,
      },
      include: { skills: { include: { skill: true } } },
    });
    return NextResponse.json(user, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

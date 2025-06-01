import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";

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
    const parsed = userSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return apiError(errors, HTTP_STATUS.BAD_REQUEST);
    }
    const prismaData = toPrismaNull(parsed.data);
    const user = await prisma.user.create({
      data: {
        ...prismaData,
        skills: parsed.data.skills
          ? {
              create: parsed.data.skills.map((skillName: string) => ({
                skill: { connect: { name: skillName } },
              })),
            }
          : undefined,
      } as any,
      include: { skills: { include: { skill: true } } },
    });
    return NextResponse.json(user, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";

const prisma = new PrismaClient();

// ユーザー詳細取得（GET）
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { skills: { include: { skill: true } } },
    });
    if (!user) {
      return apiError("ユーザーが見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    return NextResponse.json(user);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// ユーザー更新（PUT）
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const parsed = userSchema.partial().safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return apiError(errors, HTTP_STATUS.BAD_REQUEST);
    }
    const prismaData = toPrismaNull(parsed.data);
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...prismaData,
        skills: parsed.data.skills
          ? {
              deleteMany: {},
              create: parsed.data.skills.map((skillName: string) => ({
                skill: { connect: { name: skillName } },
              })),
            }
          : undefined,
      } as any,
      include: { skills: { include: { skill: true } } },
    });
    return NextResponse.json(user);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// ユーザー削除（DELETE）
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "ユーザーが削除されました" });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

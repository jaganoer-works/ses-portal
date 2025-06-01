import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";

const prisma = new PrismaClient();

// ユーザー個別取得（GET）
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { skills: { include: { skill: true } } },
    });
    if (!user) {
      return apiError("User not found", HTTP_STATUS.NOT_FOUND);
    }
    return NextResponse.json(user);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// ユーザー更新（PUT）
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    // skillsの更新は一度全削除→再作成（シンプルな実装例）
    await prisma.userSkill.deleteMany({ where: { userId: params.id } });
    const user = await prisma.user.update({
      where: { id: params.id },
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
    return NextResponse.json(user);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// ユーザー削除（DELETE）
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.userSkill.deleteMany({ where: { userId: params.id } });
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "User deleted" });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

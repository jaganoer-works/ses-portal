import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ユーザー一覧取得（GET）
export async function GET(req: NextRequest) {
  const users = await prisma.user.findMany({
    include: { skills: { include: { skill: true } } },
  });
  return NextResponse.json(users);
}

// ユーザー新規作成（POST）
export async function POST(req: NextRequest) {
  const data = await req.json();
  // 必要なバリデーション等は適宜追加
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
  return NextResponse.json(user, { status: 201 });
}

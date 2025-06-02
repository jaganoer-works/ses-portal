import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";

const prisma = new PrismaClient();

// 技術者一覧取得（GET）
export async function GET(req: NextRequest) {
  try {
    const engineers = await prisma.user.findMany({
      where: { role: "engineer" }, // 技術者のみ絞り込み
      include: { skills: { include: { skill: true } } },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(engineers);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// 技術者新規作成（POST）
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("受信したデータ:", data); // デバッグ用
    
    const parsed = userSchema.safeParse(data);
    if (!parsed.success) {
      console.log("バリデーションエラー:", parsed.error.errors); // デバッグ用
      const errors = parsed.error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return apiError(errors, HTTP_STATUS.BAD_REQUEST);
    }
    
    const prismaData = toPrismaNull({
      ...parsed.data,
      role: "engineer" // 技術者として強制設定
    });
    
    // スキルの処理を改善
    const skillConnections = parsed.data.skills
      ? await Promise.all(
          parsed.data.skills.map(async (skillName: string) => {
            // スキルが存在しない場合は作成
            const skill = await prisma.skill.upsert({
              where: { name: skillName },
              update: {},
              create: { name: skillName },
            });
            return { skillId: skill.id };
          })
        )
      : [];

    const engineer = await prisma.user.create({
      data: {
        ...prismaData,
        skills: skillConnections.length > 0
          ? {
              create: skillConnections.map(({ skillId }) => ({
                skillId,
              })),
            }
          : undefined,
      } as any,
      include: { skills: { include: { skill: true } } },
    });
    
    return NextResponse.json(engineer, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    console.error("技術者作成エラー:", e); // デバッグ用
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";
import { createSkillConnections, userInclude } from "@/lib/api/skillService";

// 技術者一覧取得（GET）
export async function GET(req: NextRequest) {
  try {
    const engineers = await prisma.user.findMany({
      where: { role: "engineer" }, // 技術者のみ絞り込み
      ...userInclude,
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
    
    const parsed = userSchema.safeParse(data);
    if (!parsed.success) {
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
    
    // 共通サービスを使用してスキル処理
    const skillConnections = await createSkillConnections(parsed.data.skills || []);

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
      ...userInclude,
    });
    
    return NextResponse.json(engineer, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    console.error("技術者作成エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
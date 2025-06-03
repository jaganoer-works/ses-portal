import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";
import { createSkillConnections, userInclude } from "@/lib/api/skillService";
import { withAuth, requirePermission } from "@/lib/authMiddleware";
import { Permission } from "@/lib/permissions";

// 技術者一覧取得（GET）- 権限チェック付き
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const { user } = session;
    
    // エンジニアロールの場合は自分の情報のみ取得可能
    if (user.role === "engineer") {
      const engineer = await prisma.user.findUnique({
        where: { 
          id: user.id,
          role: "engineer" 
        },
        ...userInclude
      });
      
      return NextResponse.json(engineer ? [engineer] : []);
    }
    
    // 管理者・営業は全技術者一覧取得可能
    const engineers = await prisma.user.findMany({
      where: { role: "engineer" },
      ...userInclude,
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json(engineers);
  } catch (e) {
    console.error("技術者一覧取得エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.ENGINEER_READ));

// 技術者新規作成（POST）- 権限チェック付き
export const POST = withAuth(async (req: NextRequest, session) => {
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
      role: "engineer", // 技術者として強制設定
      createdBy: session.user.id,
      updatedBy: session.user.id
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
}, requirePermission(Permission.ENGINEER_CREATE)); 
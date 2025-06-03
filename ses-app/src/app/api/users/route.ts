import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";
import { withAuth, requirePermission } from "@/lib/authMiddleware";
import { Permission } from "@/lib/permissions";

const prisma = new PrismaClient();

// ユーザー一覧取得（GET）- 権限チェック付き
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const users = await prisma.user.findMany({
      include: { skills: { include: { skill: true } } },
    });
    return NextResponse.json(users);
  } catch (e) {
    console.error("ユーザー一覧取得エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.USER_READ));

// ユーザー新規作成（POST）- 権限チェック付き
export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    const data = await req.json();
    const { user } = session;
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
      createdBy: user.id,
      updatedBy: user.id
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

    const newUser = await prisma.user.create({
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
    
    return NextResponse.json(newUser, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    console.error("ユーザー作成エラー:", e); // デバッグ用
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.USER_CREATE));

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";
import { withAuth, requirePermission } from "@/lib/authMiddleware";
import { Permission } from "@/lib/permissions";

const prisma = new PrismaClient();

// ユーザー詳細取得（GET）- 権限チェック付き
export const GET = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const { user } = session;
    
    // エンジニアロールの場合は自分の情報のみアクセス可能
    if (user.role === "engineer" && user.id !== id) {
      return apiError("アクセス権限がありません", HTTP_STATUS.FORBIDDEN);
    }
    
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { skills: { include: { skill: true } } },
    });
    
    if (!targetUser) {
      return apiError("ユーザーが見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    
    return NextResponse.json(targetUser);
  } catch (e) {
    console.error("ユーザー詳細取得エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.USER_READ));

// ユーザー更新（PUT）- 権限チェック付き
export const PUT = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const data = await req.json();
    const { user } = session;
    console.log("更新データ:", data); // デバッグ用
    
    // エンジニアロールの場合は自分の情報のみ更新可能
    if (user.role === "engineer" && user.id !== id) {
      return apiError("アクセス権限がありません", HTTP_STATUS.FORBIDDEN);
    }
    
    const parsed = userSchema.partial().safeParse(data);
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
      updatedBy: user.id
    });
    
    // 既存のスキル関連を削除
    if (parsed.data.skills !== undefined) {
      await prisma.userSkill.deleteMany({
        where: { userId: id }
      });
      
      // 新しいスキルを追加
      if (parsed.data.skills.length > 0) {
        const skillConnections = await Promise.all(
          parsed.data.skills.map(async (skillName: string) => {
            // スキルが存在しない場合は作成
            const skill = await prisma.skill.upsert({
              where: { name: skillName },
              update: {},
              create: { name: skillName },
            });
            return { userId: id, skillId: skill.id };
          })
        );

        await prisma.userSkill.createMany({
          data: skillConnections,
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...prismaData,
        // スキルは上記で個別に処理済み
        skills: undefined,
      } as any,
      include: { skills: { include: { skill: true } } },
    });
    
    return NextResponse.json(updatedUser);
  } catch (e) {
    console.error("ユーザー更新エラー:", e); // デバッグ用
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.USER_UPDATE));

// ユーザー削除（DELETE）- 権限チェック付き
export const DELETE = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "ユーザーが削除されました" });
  } catch (e) {
    console.error("ユーザー削除エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.USER_DELETE));

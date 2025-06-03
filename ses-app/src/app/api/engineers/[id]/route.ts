import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";
import { updateUserSkills, userInclude } from "@/lib/api/skillService";
import { withAuth, requirePermission } from "@/lib/authMiddleware";
import { Permission, isResourceOwner } from "@/lib/permissions";

// 技術者詳細取得（GET）- 権限チェック付き
export const GET = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const { user } = session;
    
    // エンジニアロールの場合は自分の情報のみアクセス可能
    if (user.role === "engineer" && !isResourceOwner(user.id, id)) {
      return apiError("他の技術者の情報にはアクセスできません", HTTP_STATUS.FORBIDDEN);
    }
    
    const engineer = await prisma.user.findFirst({
      where: { 
        id,
        role: "engineer"
      },
      ...userInclude,
    });
    
    if (!engineer) {
      return apiError("技術者が見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    
    return NextResponse.json(engineer);
  } catch (e) {
    console.error("技術者詳細取得エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.ENGINEER_READ));

// 技術者更新（PUT）- 権限チェック付き
export const PUT = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const data = await req.json();
    const { user } = session;
    
    // エンジニアロールの場合は自分の情報のみ更新可能
    if (user.role === "engineer" && !isResourceOwner(user.id, id)) {
      return apiError("他の技術者の情報は更新できません", HTTP_STATUS.FORBIDDEN);
    }
    
    // 既存の技術者が存在するか確認
    const existingEngineer = await prisma.user.findFirst({
      where: { 
        id,
        role: "engineer"
      }
    });
    if (!existingEngineer) {
      return apiError("技術者が見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    
    const parsed = userSchema.partial().safeParse(data);
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
      updatedBy: user.id
    });
    
    // 共通サービスを使用してスキル更新
    if (parsed.data.skills !== undefined) {
      await updateUserSkills(id, parsed.data.skills);
    }

    const engineer = await prisma.user.update({
      where: { id },
      data: {
        ...prismaData,
        // スキルは共通サービスで処理済み
        skills: undefined,
      } as any,
      ...userInclude,
    });
    
    return NextResponse.json(engineer);
  } catch (e) {
    console.error("技術者更新エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.ENGINEER_UPDATE));

// 技術者削除（DELETE）- 権限チェック付き
export const DELETE = withAuth(async (req: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    
    // 既存の技術者が存在するか確認
    const existingEngineer = await prisma.user.findFirst({
      where: { 
        id,
        role: "engineer"
      }
    });
    if (!existingEngineer) {
      return apiError("技術者が見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "技術者が削除されました" });
  } catch (e) {
    console.error("技術者削除エラー:", e);
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}, requirePermission(Permission.ENGINEER_DELETE)); 
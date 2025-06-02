import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";
import { updateUserSkills, userInclude } from "@/lib/api/skillService";

// 技術者詳細取得（GET）
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const engineer = await prisma.user.findFirst({
      where: { 
        id,
        role: "engineer" // 技術者のみ
      },
      ...userInclude,
    });
    if (!engineer) {
      return apiError("技術者が見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    return NextResponse.json(engineer);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// 技術者更新（PUT）
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
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
      role: "engineer" // 技術者として強制設定
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
}

// 技術者削除（DELETE）
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
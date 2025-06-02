import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";

const prisma = new PrismaClient();

// 技術者詳細取得（GET）
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const engineer = await prisma.user.findFirst({
      where: { 
        id,
        role: "engineer" // 技術者のみ
      },
      include: { skills: { include: { skill: true } } },
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
    console.log("更新データ:", data); // デバッグ用
    
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

    const engineer = await prisma.user.update({
      where: { id },
      data: {
        ...prismaData,
        // スキルは上記で個別に処理済み
        skills: undefined,
      } as any,
      include: { skills: { include: { skill: true } } },
    });
    
    return NextResponse.json(engineer);
  } catch (e) {
    console.error("技術者更新エラー:", e); // デバッグ用
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
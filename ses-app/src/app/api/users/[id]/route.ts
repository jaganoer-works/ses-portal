import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { userSchema } from "@/lib/schema/userSchema";
import { toPrismaNull } from "@/lib/prismaUtils";

const prisma = new PrismaClient();

// ユーザー詳細取得（GET）
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { skills: { include: { skill: true } } },
    });
    if (!user) {
      return apiError("ユーザーが見つかりません", HTTP_STATUS.NOT_FOUND);
    }
    return NextResponse.json(user);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// ユーザー更新（PUT）
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    console.log("更新データ:", data); // デバッグ用
    
    const parsed = userSchema.partial().safeParse(data);
    if (!parsed.success) {
      console.log("バリデーションエラー:", parsed.error.errors); // デバッグ用
      const errors = parsed.error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return apiError(errors, HTTP_STATUS.BAD_REQUEST);
    }
    
    const prismaData = toPrismaNull(parsed.data);
    
    // 既存のスキル関連を削除
    if (parsed.data.skills !== undefined) {
      await prisma.userSkill.deleteMany({
        where: { userId: params.id }
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
            return { userId: params.id, skillId: skill.id };
          })
        );

        await prisma.userSkill.createMany({
          data: skillConnections,
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...prismaData,
        // スキルは上記で個別に処理済み
        skills: undefined,
      } as any,
      include: { skills: { include: { skill: true } } },
    });
    
    return NextResponse.json(user);
  } catch (e) {
    console.error("ユーザー更新エラー:", e); // デバッグ用
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// ユーザー削除（DELETE）
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "ユーザーが削除されました" });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

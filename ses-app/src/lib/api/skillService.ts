import { prisma } from '@/lib/prisma';

/**
 * スキル名の配列からUserSkill関連のデータを作成・取得
 */
export async function createSkillConnections(skills: string[]) {
  if (!skills || skills.length === 0) return [];

  return await Promise.all(
    skills.map(async (skillName: string) => {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName },
      });
      return { skillId: skill.id };
    })
  );
}

/**
 * ユーザーのスキル関連を更新（既存削除 → 新規作成）
 */
export async function updateUserSkills(userId: string, skillNames: string[]) {
  // 既存スキル関連を削除
  await prisma.userSkill.deleteMany({
    where: { userId }
  });

  // 新しいスキルを追加
  if (skillNames.length > 0) {
    const skillConnections = await Promise.all(
      skillNames.map(async (skillName: string) => {
        const skill = await prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName },
        });
        return { userId, skillId: skill.id };
      })
    );

    await prisma.userSkill.createMany({
      data: skillConnections,
    });
  }
}

/**
 * 共通のユーザー取得時のinclude設定
 */
export const userInclude = {
  include: { skills: { include: { skill: true } } }
}; 
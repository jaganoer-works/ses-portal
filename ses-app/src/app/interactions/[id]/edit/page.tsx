import { notFound } from "next/navigation";
import { InteractionEditClient } from "./InteractionEditClient";
import { prisma } from "@/lib/prisma";
import { Interaction } from "@/lib/types/project";

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchInteraction(id: string): Promise<Interaction | null> {
  try {
    const interaction = await prisma.interaction.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
    
    if (!interaction) {
      return null;
    }
    
    // engineerとuserを別途取得
    const engineer = await prisma.user.findUnique({
      where: { id: interaction.engineerId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    const user = interaction.createdBy 
      ? await prisma.user.findUnique({
          where: { id: interaction.createdBy },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : null;
    
    // PrismaのDate型をstring型に変換してInteraction型に適合させる
    return {
      ...interaction,
      engineer,
      user,
      createdAt: interaction.createdAt.toISOString(),
      updatedAt: interaction.updatedAt.toISOString(),
      readAt: interaction.readAt?.toISOString() || null,
    } as Interaction;
  } catch (error) {
    console.error("やりとりデータ取得エラー:", error);
    throw new Error("やりとりデータの取得に失敗しました");
  }
}

export default async function EditInteractionPage({ params }: Props) {
  const { id } = await params;

  let interaction: Interaction | null;
  try {
    interaction = await fetchInteraction(id);
  } catch (error) {
    console.error("やりとり詳細取得エラー:", error);
    notFound();
  }
  
  if (!interaction) {
    notFound();
  }

  return <InteractionEditClient interaction={interaction} />;
} 
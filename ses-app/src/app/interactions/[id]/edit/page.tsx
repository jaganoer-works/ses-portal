import { notFound } from "next/navigation";
import { fetchInteraction } from "@/lib/api/interactions";
import { InteractionEditClient } from "./InteractionEditClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditInteractionPage({ params }: Props) {
  const { id } = await params;

  let interaction;
  try {
    interaction = await fetchInteraction(id);
  } catch (error) {
    console.error("やりとり詳細取得エラー:", error);
    notFound();
  }

  return <InteractionEditClient interaction={interaction} />;
} 
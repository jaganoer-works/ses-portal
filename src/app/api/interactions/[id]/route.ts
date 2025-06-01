import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { apiError } from "@/lib/apiError";
import { HTTP_STATUS } from "@/lib/httpStatus";
import { interactionSchema } from "@/lib/schema/interactionSchema";

const prisma = new PrismaClient();

// Prismaのoptional値をnullに変換するユーティリティ
function toPrismaNull<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
  ) as Partial<T>;
}

// やりとり個別取得（GET）
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interaction = await prisma.interaction.findUnique({
      where: { id: params.id },
      include: { project: true },
    });
    if (!interaction) {
      return apiError("Interaction not found", HTTP_STATUS.NOT_FOUND);
    }
    return NextResponse.json(interaction);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// やりとり更新（PUT）
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const parsed = interactionSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return apiError(errors, HTTP_STATUS.BAD_REQUEST);
    }
    const prismaData = toPrismaNull(parsed.data);
    const interaction = await prisma.interaction.update({
      where: { id: params.id },
      data: { ...prismaData } as any,
      include: { project: true },
    });
    return NextResponse.json(interaction);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// やりとり削除（DELETE）
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.interaction.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Interaction deleted" });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
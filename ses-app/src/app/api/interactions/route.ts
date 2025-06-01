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

// やりとり一覧取得（GET）
export async function GET(req: NextRequest) {
  try {
    const interactions = await prisma.interaction.findMany({
      include: { project: true },
    });
    return NextResponse.json(interactions);
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// やりとり新規作成（POST）
export async function POST(req: NextRequest) {
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
    const interaction = await prisma.interaction.create({
      data: { ...prismaData } as any,
      include: { project: true },
    });
    return NextResponse.json(interaction, { status: HTTP_STATUS.CREATED });
  } catch (e) {
    return apiError(e as string | Error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 
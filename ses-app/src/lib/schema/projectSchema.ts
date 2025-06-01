import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "titleは必須です"),
  price: z.number().int().positive("priceは正の整数で指定してください"),
  periodStart: z.string().datetime({ message: "periodStartはISO8601形式の日付文字列で指定してください" }),
  periodEnd: z.string().datetime({ message: "periodEndはISO8601形式の日付文字列で指定してください" }),
  description: z.string().optional(),
  status: z.string().min(1, "statusは必須です"),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
  lastContactedAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
}); 
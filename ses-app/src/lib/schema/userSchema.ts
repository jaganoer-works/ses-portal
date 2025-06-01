import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "nameは必須です"),
  email: z.string().email("emailは有効なメールアドレス形式で指定してください"),
  desiredPrice: z.number().int().nonnegative("desiredPriceは0以上の整数で指定してください"),
  availableFrom: z.string().datetime({ message: "availableFromはISO8601形式の日付文字列で指定してください" }),
  description: z.string().optional(),
  status: z.string().min(1, "statusは必須です"),
  role: z.string().min(1, "roleは必須です"),
  isAvailable: z.boolean(),
  skills: z.array(z.string()).optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
}); 
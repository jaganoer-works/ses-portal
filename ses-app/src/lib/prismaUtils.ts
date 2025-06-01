/**
 * Prismaのoptional値をnullに変換するユーティリティ
 * undefinedはPrismaでは無視されるが、nullは明示的にDBに保存される
 */
export function toPrismaNull<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
  ) as Partial<T>;
}

/**
 * Prismaのnull値をundefinedに変換するユーティリティ
 * API レスポンス用
 */
export function fromPrismaNull<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === null ? undefined : v])
  ) as T;
} 
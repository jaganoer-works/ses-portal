import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // 認証が不要なパス
  const publicPaths = [
    "/auth/signin",
    "/auth/signout",
    "/api/auth",
  ];
  
  // 静的ファイルやAPIルート（認証以外）は除外
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }
  
  // 公開パスは認証不要
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // 認証が必要なパスで未認証の場合はログインページにリダイレクト
  if (!req.auth) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}; 
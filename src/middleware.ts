import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const { pathname } = req.nextUrl;
  const isLoggedIn = !!token;
  const isAdmin = token?.role === "ADMIN";

  const isAuthPage = pathname.startsWith("/login");
  const isAdminPage = pathname.startsWith("/admin");
  const isPublic =
    isAuthPage ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/register";

  if (!isPublic && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPage && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/register";

  if (token) {
    try {
      jwt.verify(token, "secret_key");

      // Nếu đã đăng nhập và vào trang login/register thì redirect về trang chủ
      if (isAuthPage) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return NextResponse.next();
    } catch (err) {
      // Token lỗi => redirect về login và xoá token
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }
  }

  // Nếu chưa đăng nhập và vào trang cần bảo vệ thì redirect về login
  const protectedPaths = ["/account", "/admin", "/profile"];
  const isProtected = protectedPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`)
  );

  if (isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/account", "/admin/:path*", "/profile"],
};

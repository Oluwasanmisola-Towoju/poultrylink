import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/api/config";

const PROTECTED_PREFIXES = ["/profile", "/orders", "/messages", "/admin", "/listings/new"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const hasSession = Boolean(req.cookies.get(REFRESH_TOKEN_COOKIE)?.value);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);

  // Note: this only checks "is someone logged in", not their role — /admin
  // is gated here the same as /profile for now. Real role enforcement lives
  // on the Express API for every request regardless; we'll add a role check
  // here (decoding the access token's role claim) when we build the admin
  // pages, purely as a UX shortcut so non-admins don't see the shell flash.
}

export const config = {
  matcher: ["/profile/:path*", "/orders/:path*", "/messages/:path*", "/admin/:path*", "/listings/new"],
};
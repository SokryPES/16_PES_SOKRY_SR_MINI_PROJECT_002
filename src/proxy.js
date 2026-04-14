import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const protectedRoutes = ["/products", "/orders", "/manage-products", "/cart"];
const authRoutes = ["/login", "/register"];

function isRouteMatch(pathname, routes) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  if (isRouteMatch(pathname, authRoutes) && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/products";
    return NextResponse.redirect(url);
  }

  if (isRouteMatch(pathname, protectedRoutes) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
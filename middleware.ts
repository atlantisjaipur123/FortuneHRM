import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Accept both session cookie names (old & new)
  const sessionCookie = request.cookies.get("session_user") || request.cookies.get("session")

  const { pathname } = request.nextUrl

  const publicRoutes = ["/", "/login", "/signup", "/forgot-password"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // If NOT logged in and NOT on public page → redirect to login
  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If logged in and visiting login/signup → redirect based on role
  if (sessionCookie && (pathname === "/login" || pathname === "/signup")) {
    try {
      const user = JSON.parse(sessionCookie.value)

      // Super admin dashboard
      if (user.role === "super_admin") {
        return NextResponse.redirect(new URL("/super-admin", request.url))
      }

      // Company admin dashboard
      if (user.role === "company_admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Default for regular employee
      return NextResponse.redirect(new URL("/employee", request.url))
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Role-based protection (only checks when logged in)
  if (sessionCookie) {
    try {
      const user = JSON.parse(sessionCookie.value)

      // Super admin only
      if (pathname.startsWith("/super-admin") && user.role !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Company admin only
      if (pathname.startsWith("/dashboard") && user.role !== "company_admin") {
        return NextResponse.redirect(new URL("/super-admin", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

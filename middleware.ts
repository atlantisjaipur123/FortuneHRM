import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password"]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname)

  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If has session and trying to access auth pages
  if (session && (pathname === "/login" || pathname === "/signup")) {
    try {
      const user = JSON.parse(session.value)
      if (user.role === "super_admin") {
        return NextResponse.redirect(new URL("/super-admin", request.url))
      } else if (user.companyId) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } else {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }
    } catch {
      // Invalid session, continue to login
    }
  }

  // Role-based route protection
  if (session) {
    try {
      const user = JSON.parse(session.value)

      // Super admin routes
      if (pathname.startsWith("/super-admin") && user.role !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Company admin routes
      if (pathname.startsWith("/dashboard") && user.role !== "company_admin") {
        return NextResponse.redirect(new URL("/super-admin", request.url))
      }

      // Redirect company admin without company to onboarding
      if (pathname.startsWith("/dashboard") && user.role === "company_admin" && !user.companyId) {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }
    } catch {
      // Invalid session, redirect to login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

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
}

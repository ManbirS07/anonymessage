import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const url = request.nextUrl

    // If the user is not authenticated and trying to access a protected route, redirect them to the sign-in page
    if (!token && url.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url))
    }

    // If the user is already authenticated and trying to access the sign-in/sign-up page, redirect them to the dashboard
    if (token && (url.pathname === "/auth/sign-in" || url.pathname === "/auth/sign-up" || url.pathname.startsWith("/auth/verify-code"))) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }
}
 
// defines the paths on which I want the middleware to run
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/verify-code/:path*'
  ]
}
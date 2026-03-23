import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { toast } from 'sonner'

export async function proxy(request: NextRequest) {
  
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const url = request.nextUrl //get the path of the request, e.g. /dashboard or /api/auth/signin

    // If the user is not authenticated and trying to access a protected route, redirect them to the sign-in page
    if (!token && url.pathname !== "/api/auth/signin") {
        return NextResponse.redirect(new URL("auth/sign-in", request.url))
    }

    // If the user is already authenticated and trying to access the sign-in/sign-up page, redirect them to the dashboard
    if (token && (url.pathname === "/api/auth/signin" || url.pathname === "/api/auth/signup" || url.pathname === "/" || url.pathname === "/verify")) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }
}
 
// defines the paths on which I want the middleware to run
export const config = {
  matcher: [
    '/dashboard/:path*'
  ]
}
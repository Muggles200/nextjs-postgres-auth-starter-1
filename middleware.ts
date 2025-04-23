import NextAuth from 'next-auth';
import { authConfig } from 'app/auth.config';
import { NextResponse } from 'next/server';
import { auth } from 'app/auth';
import { NextRequest } from 'next/server';

export default NextAuth(authConfig).auth;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware processing for static assets and API routes
  if (
    pathname.startsWith('/_next/') || 
    pathname.includes('/static/') || 
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // Handle maintenance mode
  if (!pathname.startsWith('/api/')) {
    try {
      const maintenanceResponse = await fetch(`${request.nextUrl.origin}/api/maintenance`, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (maintenanceResponse.ok) {
        const { isMaintenanceMode } = await maintenanceResponse.json();
        const isMaintenancePage = pathname === '/maintenance';
        
        // Get session only when needed for maintenance mode checks
        const session = await auth();
        const isAdmin = session?.user?.role === 'admin';
        
        if (isMaintenanceMode && !isMaintenancePage && !isAdmin) {
          return NextResponse.redirect(new URL('/maintenance', request.url));
        }
        
        if (!isMaintenanceMode && isMaintenancePage) {
          return NextResponse.redirect(new URL('/', request.url));
        }
        
        // Handle protected routes
        if (pathname.startsWith('/protected')) {
          if (!session?.user) {
            return NextResponse.redirect(new URL('/login', request.url));
          }
          
          // Role-based access control
          if (pathname.startsWith('/protected/admin') && !isAdmin) {
            return NextResponse.redirect(new URL('/protected/user', request.url));
          }
          
          if (pathname.startsWith('/protected/user') && session.user.role !== 'user') {
            return NextResponse.redirect(new URL('/protected/admin', request.url));
          }
        }
      }
    } catch (error) {
      console.error('Middleware error:', error);
      // Continue to the page on error rather than breaking the application
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected routes
    '/protected/:path*',
    '/((?!api|_next/static|_next/image|.*\\.png$).*)'
  ],
};
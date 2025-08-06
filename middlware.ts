import { clerkMiddleware, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email-address',
  '/api/webook/register',
];

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const  {userId}  = (await auth());
  const pathname = req.nextUrl.pathname;

  if (!userId && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  try {
    if (userId) {
      const user = (await clerkClient()).users.getUser(userId);
      const role = (await user).publicMetadata.role as string | undefined;

      // Redirect admin users if not already in /admin route
      if (role === 'admin' && !pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }

      // Block non-admin users from accessing admin routes
      if (role !== 'admin' && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Block authenticated users from accessing public routes
      if (publicRoutes.includes(pathname)) {
        return NextResponse.redirect(
          new URL(role === 'admin' ? '/admin/dashboard' : '/dashboard', req.url)
        );
      }
    }
  } catch (err) {
    console.error('Middleware error:', err);
    return NextResponse.redirect(new URL('/error', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and _next internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

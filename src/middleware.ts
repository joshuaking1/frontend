// frontend/src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/auth/sign-up', '/auth/sign-in'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If user is not logged in and not on a public route, redirect to sign-in
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  if (user) {
    // If logged in, trying to access auth pages, redirect to dashboard
    if (pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const { data: profile } = await supabase.from('profiles').select('onboarding_complete, role').eq('id', user.id).single();

    if (!profile) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
    
    // Handle onboarding redirection
    if (!profile.onboarding_complete) {
        const onboardingUrl = `/onboarding/${profile.role}`;
        if (pathname !== onboardingUrl) {
            return NextResponse.redirect(new URL(onboardingUrl, request.url));
        }
        return response; // Allow access to their correct onboarding page
    }

    // --- THE DEFINITIVE FIX FOR ONBOARDED USERS ---
    // If onboarding is complete, ensure they stay within their designated area.
    const requiredPathPrefix = `/dashboard/${profile.role}`;
    
    // Allow access to shared profile pages
    if (pathname.startsWith('/dashboard/profile')) {
        return response;
    }

    // If they are not in their correct dashboard area, redirect them.
    if (!pathname.startsWith(requiredPathPrefix)) {
        // Handle generic /dashboard redirect
        if (pathname === '/dashboard') {
             return NextResponse.redirect(new URL(requiredPathPrefix, request.url));
        }
        // For any other mismatch, send them home.
        return NextResponse.redirect(new URL(requiredPathPrefix, request.url));
    }
  }

  // Allow all other valid requests to proceed
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

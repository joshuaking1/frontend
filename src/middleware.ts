// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware'; // We will create this helper next

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // If the user is not logged in
  if (authError || !user) {
    // Allow access to public pages
    if (pathname === '/' || pathname.startsWith('/auth')) {
      return response;
    }
    // Redirect all other pages to the sign-in page
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // If the user is logged in
  if (user) {
    // If user tries to access auth pages while logged in, redirect to dashboard
    if (pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_complete, role')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
        // This could happen if profile creation failed. Log them out.
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
    
    const isOnboardingComplete = profile.onboarding_complete;
    const userRole = profile.role;

    if (!isOnboardingComplete) {
      const onboardingUrl = `/onboarding/${userRole}`;
      // If they are not on their correct onboarding page, redirect them.
      if (pathname !== onboardingUrl) {
        return NextResponse.redirect(new URL(onboardingUrl, request.url));
      }
    } else { // If onboarding is complete
      const requiredPathPrefix = `/dashboard/${userRole}`;
      
      // --- Add exceptions for shared dashboard routes ---
      if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard/profile')) {
        // In production, you might add role checks here for admin
        return response; // Allow the request to proceed
      }
      
      const isGenericDashboardPath = pathname === '/dashboard';
      
      // If the user is not in their required dashboard section or a shared section, redirect them.
      if (!pathname.startsWith(requiredPathPrefix)) {
         if (isGenericDashboardPath) {
            return NextResponse.redirect(new URL(requiredPathPrefix, request.url));
         }
         return NextResponse.redirect(new URL(requiredPathPrefix, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);

  // Redirect authenticated user away from auth page
  if (user && url.pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated user accessing protected pages
  if (!user && (
    url.pathname.startsWith('/profile') ||
    url.pathname.startsWith('/order-detail') ||
    url.pathname.startsWith('/admin')
  )) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return supabaseResponse;
}
